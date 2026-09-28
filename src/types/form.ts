export type FieldType =
    | 'shortText'
    | 'longText'
    | 'email'
    | 'phone'
    | 'number'
    | 'singleChoice'
    | 'multiChoice'
    | 'date'
    | 'yesNo';

export type FormStatus = 'draft' | 'published' | 'closed';

/**
 * Who may submit. Layered on top of the access tiers in src/lib/config.ts:
 *
 * - `public`    anyone, including guests with no account
 * - `university` any signed-in Egyptian university account (either tier)
 * - `zewail`    Zewail City students only
 * - `members`   users whose profile carries role member/admin
 */
export type FormAudience = 'public' | 'university' | 'zewail' | 'members';

export type ResponseStatus = 'new' | 'reviewed' | 'shortlisted';

export interface FormField {
    /** Stable identifier; answers are keyed by it, so it must survive edits. */
    id: string;
    type: FieldType;
    label: string;
    help?: string;
    required: boolean;
    /** Only for singleChoice / multiChoice. */
    options?: string[];
}

export type AnswerValue = string | string[] | number | boolean | null;

export interface FormDoc {
    title: string;
    description?: string;
    status: FormStatus;
    audience: FormAudience;
    fields: FormField[];
    createdBy: string;
    createdByEmail: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface FormResponse {
    /** Field id -> value. */
    answers: Record<string, AnswerValue>;
    submitter: {
        userId: string | null;
        name: string;
        email: string;
        university?: string;
    };
    status: ResponseStatus;
    notes?: string;
    reviewedAt?: any;
    reviewedBy?: string;
    createdAt?: any;
}

/** Documents paired with their Firestore document id, for list views. */
export type FormDocWithId = FormDoc & { id: string };
export type FormResponseWithId = FormResponse & { id: string };

export const FIELD_TYPES: { value: FieldType; label: string; needsOptions: boolean }[] = [    { value: 'shortText', label: 'Short text', needsOptions: false },
    { value: 'longText', label: 'Long text', needsOptions: false },
    { value: 'email', label: 'Email', needsOptions: false },
    { value: 'phone', label: 'Phone', needsOptions: false },
    { value: 'number', label: 'Number', needsOptions: false },
    { value: 'date', label: 'Date', needsOptions: false },
    { value: 'yesNo', label: 'Yes / No', needsOptions: false },
    { value: 'singleChoice', label: 'Single choice', needsOptions: true },
    { value: 'multiChoice', label: 'Multiple choice', needsOptions: true },
];

export const RESPONSE_STATUSES: ResponseStatus[] = ['new', 'reviewed', 'shortlisted'];
