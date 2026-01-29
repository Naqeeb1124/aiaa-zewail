export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    studentId: string;
    joinedAt: any;

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
