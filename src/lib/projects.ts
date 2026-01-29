import { db } from './firebase';
import {
    doc,
    collection,
    addDoc,
    updateDoc,
    arrayUnion,
    serverTimestamp,
    runTransaction,
    increment,
    query,
    where,
    getDocs,
    getDoc
} from 'firebase/firestore';
import { Project, JoinRequest, ProjectStatus, ProjectType } from '../types/project';
import { UserProfile } from '../types/user';

const REQUESTS_COLL = 'joinRequests';
const PROJECTS_COLL = 'projects';
const USERS_COLL = 'users';

// Helper to determine current semester based on date
export const getCurrentSemester = () => {
    // Basic logic: Jan-Jun = Spring, Jul-Aug = Summer, Sep-Dec = Fall
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    if (month >= 0 && month <= 5) return `Spring ${year}`;
    if (month >= 6 && month <= 7) return `Summer ${year}`;
    return `Fall ${year}`;
};

/**
 * Creates a join request.
 * Checks prevent duplicate requests and flagship limits.
 */
export const createJoinRequest = async (
    projectId: string,
    userId: string,
    semester: string = getCurrentSemester()
) => {
    return runTransaction(db, async (transaction) => {
        // 1. Get User Profile
        const userRef = doc(db, USERS_COLL, userId);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("User not found");

        const userData = userSnap.data() as UserProfile;

        // 2. Get Project Data
        const projectRef = doc(db, PROJECTS_COLL, projectId);
        const projectSnap = await transaction.get(projectRef);
        if (!projectSnap.exists()) throw new Error("Project not found");

        const projectData = projectSnap.data() as Project;

        // 3. Check Join Status (don't allow if closed/full)
        if (projectData.status === 'Completed' || projectData.status === 'On Hold') {
            throw new Error("Project is not accepting members.");
        }

        // 4. Constraint Check: Flagship Limit
        if (projectData.type === 'Flagship') {
            // Check if user already has an active flagship for this semester
            const currentFlagshipId = userData.activeFlagship?.[semester];
            if (currentFlagshipId) {
                // If they are already in a flagship project (accepted), block
                // If they have a request pending, maybe block too?
                // Let's assume activeFlagship tracks ACCEPTED projects.
                throw new Error(`You can only join one Flagship project per semester. You are already in ${currentFlagshipId}.`);
            }
        }

        // 5. Check if already requested (prevent duplicates)
        // We can query requests collection in a transaction? No, queries in transactions must be on specific docs or use strict constraints. 
        // Better: store pending requests ID in user doc to check quickly.
        // OR: query before transaction, then rely on transaction for critical write.
        // For now, let's assume UI handles basic dupe check, and backend catches it via unique ID if we use composite key.
        // Let's use composite ID for request: `${userId}_${projectId}`

        const requestId = `${userId}_${projectId}`;
        const requestRef = doc(db, REQUESTS_COLL, requestId);
        const existingRequest = await transaction.get(requestRef);

        if (existingRequest.exists()) {
            throw new Error("You have already applied to this project.");
        }

        // 6. Create Request
        const newRequest: JoinRequest = {
            id: requestId,
            projectId,
            projectTitle: projectData.title,
            projectType: projectData.type,
            semester,
            userId,
            userName: userData.name,
            userEmail: userData.email,
            studentId: userData.studentId,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        transaction.set(requestRef, newRequest);

        // Optional: Update user's history
        transaction.update(userRef, {
            projectHistory: arrayUnion({
                projectId,
                semester,
                type: projectData.type,
                status: 'pending'
            })
        });

        return requestId;
    });
};

/**
 * Approves a join request.
 * Updates seat counts and user status.
 */
export const approveRequest = async (requestId: string, adminId: string) => { // adminId for logging
    return runTransaction(db, async (transaction) => {
        // 1. Get All Required Documents First (Reads)
        const requestRef = doc(db, REQUESTS_COLL, requestId);
        const requestSnap = await transaction.get(requestRef);
        if (!requestSnap.exists()) throw new Error("Request not found");
        const requestData = requestSnap.data() as JoinRequest;

        const projectRef = doc(db, PROJECTS_COLL, requestData.projectId);
        const projectSnap = await transaction.get(projectRef);
        if (!projectSnap.exists()) throw new Error("Project not found");
        const projectData = projectSnap.data() as Project;

        const userRef = doc(db, USERS_COLL, requestData.userId);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("User not found");
        const userData = userSnap.data() as UserProfile;

        // 2. Validate State
        if (requestData.status !== 'pending') throw new Error("Request is not pending.");
        if (projectData.currentSeats >= projectData.maxSeats) {
            throw new Error("Project is full. Cannot approve.");
        }

        if (requestData.projectType === 'Flagship') {
            const currentFlagshipId = userData.activeFlagship?.[requestData.semester];
            if (currentFlagshipId && currentFlagshipId !== requestData.projectId) {
                throw new Error(`User is already in flagship project: ${currentFlagshipId}`);
            }
        }

        // 3. Execute Writes
        // Update Project Seats
        transaction.update(projectRef, {
            currentSeats: increment(1)
        });

        // Update Request Status
        transaction.update(requestRef, {
            status: 'accepted',
            updatedAt: serverTimestamp(),
            approvedBy: adminId
        });

        // Update User Profile (mark flagship as active if applicable and update history)
        const updatedHistory = userData.projectHistory?.map(h => 
            (h.projectId === requestData.projectId && h.semester === requestData.semester) 
            ? { ...h, status: 'accepted' as const } 
            : h
        ) || [];

        const userUpdates: any = {
            projectHistory: updatedHistory
        };

        if (requestData.projectType === 'Flagship') {
            userUpdates[`activeFlagship.${requestData.semester}`] = requestData.projectId;
        }

        transaction.update(userRef, userUpdates);

        // Add to members subcollection for scalability
        const memberRef = doc(db, PROJECTS_COLL, requestData.projectId, 'members', requestData.userId);
        transaction.set(memberRef, {
            userId: requestData.userId,
            name: requestData.userName,
            email: requestData.userEmail,
            role: 'member',
            joinedAt: serverTimestamp()
        });
    });
};

/**
 * Rejects a join request.
 */
export const rejectRequest = async (requestId: string, adminId: string) => {
    return runTransaction(db, async (transaction) => {
        const requestRef = doc(db, REQUESTS_COLL, requestId);
        const requestSnap = await transaction.get(requestRef);
        if (!requestSnap.exists()) throw new Error("Request not found");
        const requestData = requestSnap.data() as JoinRequest;

        const userRef = doc(db, USERS_COLL, requestData.userId);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("User not found");
        const userData = userSnap.data() as UserProfile;

        // Update Request
        transaction.update(requestRef, {
            status: 'rejected',
            updatedAt: serverTimestamp(),
            rejectedBy: adminId
        });

        // Update User History
        const updatedHistory = userData.projectHistory?.map(h => 
            (h.projectId === requestData.projectId && h.semester === requestData.semester) 
            ? { ...h, status: 'rejected' as const } 
            : h
        ) || [];

        transaction.update(userRef, {
            projectHistory: updatedHistory
        });
    });
};

/**
 * Cancels a join request or leaves a project.
 */
export const cancelJoinRequest = async (requestId: string) => {
    return runTransaction(db, async (transaction) => {
        const requestRef = doc(db, REQUESTS_COLL, requestId);
        const requestSnap = await transaction.get(requestRef);
        if (!requestSnap.exists()) throw new Error("Request not found");
        const requestData = requestSnap.data() as JoinRequest;

        const userRef = doc(db, USERS_COLL, requestData.userId);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("User not found");
        const userData = userSnap.data() as UserProfile;

        // If it was already accepted, we need to decrement seats and remove member record
        if (requestData.status === 'accepted') {
            const projectRef = doc(db, PROJECTS_COLL, requestData.projectId);
            const projectSnap = await transaction.get(projectRef);
            
            // Only update seats if project still exists
            if (projectSnap.exists()) {
                transaction.update(projectRef, {
                    currentSeats: increment(-1)
                });

                // Remove from members subcollection
                const memberRef = doc(db, PROJECTS_COLL, requestData.projectId, 'members', requestData.userId);
                transaction.delete(memberRef);
            }

            // If it was a flagship, clear the active flagship status
            if (requestData.projectType === 'Flagship') {
                transaction.update(userRef, {
                    [`activeFlagship.${requestData.semester}`]: null
                });
            }
        }

        // Remove from user history
        const updatedHistory = userData.projectHistory?.filter(h => 
            !(h.projectId === requestData.projectId && h.semester === requestData.semester)
        ) || [];

        transaction.update(userRef, {
            projectHistory: updatedHistory
        });

        // Delete the request itself
        transaction.delete(requestRef);
    });
};

/**
 * For Admins: Manually add a member (bypassing seats if needed, or update seats)
 */
export const manualAddMember = async (projectId: string, userId: string, role: 'member' | 'lead' = 'member') => {
    // Similar to approveRequest but without a request doc requirement
    // ...
};
