import type { Affiliation } from '../lib/config';

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    /** Zewail City student ID. Empty for external students, who have no such ID. */
    studentId: string;
    joinedAt: any;
    role?: 'member' | 'admin';

    /**
     * Which access tier this account was admitted under. Set at sign-in and
     * used for display only — Firestore rules re-derive the tier from the
     * verified ID token email, so a tampered value grants nothing.
     */
    affiliation?: Affiliation;
    university?: string;

    /**
     * Bachelor's program, collected from AUC visitors after sign-in through
     * the major picker. Grants no privileges, so it is client-writable.
     */
    major?: string;
    majorUpdatedAt?: any;

    // Track active flagship project to enforce "1 per semester" rule
    // Map key: semester (e.g., "Spring 2024"), Value: projectId
    activeFlagship?: {
        [semester: string]: string;
    };

    // Track all project history
    projectHistory?: {
        projectId: string;
        semester: string;
        type: 'Flagship' | 'Non-flagship';
        status: 'pending' | 'accepted' | 'rejected' | 'completed';
    }[];
}
