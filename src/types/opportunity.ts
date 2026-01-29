export interface Opportunity {
    id: string;
    title: string;
    organization: string;
    type: 'internship' | 'scholarship' | 'research' | 'competition';
    location: string;
    deadline: string; // ISO date string
    description: string;
    link: string;
    tags: string[];
    gpaRequirement?: number;
    level?: ('undergrad' | 'grad' | 'phd')[];
}