export type ProjectType = 'Flagship' | 'Non-flagship';
export type ProjectStatus = 'Planning' | 'Recruiting' | 'In Progress' | 'Completed' | 'On Hold';

export interface Project {
    id: string;
    title: string;
    type: ProjectType;
    semester: string; // e.g., "Spring 2024"
    category: string;
    description: string;
    status: ProjectStatus;
    icon: string;
    progress: number;
    maxSeats: number;
    currentSeats: number;
    createdAt: any; // Firestore Timestamp
    updatedAt?: any;
}

export interface JoinRequest {
    id: string;
    projectId: string;
    projectTitle: string;
    projectType: ProjectType;
    semester: string;
    userId: string;
    userName: string;
    userEmail: string;
    studentId: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: any;
    updatedAt?: any;
}

export interface ProjectMember {
    userId: string;
    name: string;
    email: string;
    role: 'member' | 'lead';
    joinedAt: any;
}
