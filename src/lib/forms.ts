import {
    FIELD_TYPES,
    type AnswerValue,
    type FieldType,
    type FormAudience,
    type FormField,
} from '../types/form';

/** Field ids appear in stored answers, so they must stay unique and stable. */
export const newFieldId = () =>
    `f_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const MAX_SHORT = 200;
export const MAX_LONG = 4000;
export const MAX_OPTIONS = 30;

export const typeNeedsOptions = (type: FieldType) =>
    FIELD_TYPES.find(t => t.value === type)?.needsOptions ?? false;

/**
 * Strip anything a builder should never persist: unknown field types, blank
 * labels, option lists on non-choice fields, oversized option lists.
 * Run on save so a malformed schema cannot reach the submit endpoint.
 */
export const normalizeFields = (input: any): FormField[] => {
    if (!Array.isArray(input)) return [];
    const seen = new Set<string>();

    return input
        .filter((raw: any) => raw && typeof raw === 'object')
        .map((raw: any): FormField | null => {
            const type = raw.type as FieldType;
            if (!FIELD_TYPES.some(t => t.value === type)) return null;

            const label = String(raw.label ?? '').trim().slice(0, 200);
            if (!label) return null;

            // Field ids come from the builder, but never trust them blindly.
            let id = String(raw.id ?? '').trim();
            if (!id || seen.has(id)) id = newFieldId();
            seen.add(id);

            const options = typeNeedsOptions(type)
                ? (Array.isArray(raw.options) ? raw.options : [])
                    .map((o: any) => String(o).trim().slice(0, 120))
                    .filter(Boolean)
                    .slice(0, MAX_OPTIONS)
                : undefined;

            return {
                id,
                type,
                label,
                help: String(raw.help ?? '').trim().slice(0, 300) || undefined,
                required: raw.required === true,
                ...(options && options.length ? { options } : {}),
            };
        })
        .filter((f): f is FormField => f !== null);
};

const asText = (value: AnswerValue): string => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
};

/**
 * Validate and coerce one answer against its field definition.
 * Returns the cleaned value, or an error message when it is unacceptable.
 */
export const validateAnswer = (
    field: FormField,
    value: AnswerValue | undefined
): { ok: true; value: AnswerValue } | { ok: false; error: string } => {
    const empty =
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0);

    if (empty) {
        return field.required
            ? { ok: false, error: `${field.label} is required.` }
            : { ok: true, value: field.type === 'multiChoice' ? [] : null };
    }

    switch (field.type) {
        case 'yesNo': {
            if (typeof value === 'boolean') return { ok: true, value };
            const text = asText(value).toLowerCase();
            if (text !== 'true' && text !== 'false') {
                return { ok: false, error: `${field.label} must be yes or no.` };
            }
            return { ok: true, value: text === 'true' };
        }

        case 'number': {
            const raw = asText(value).trim();
            // Reject anything Number() would silently coerce, e.g. '12abc' or ''.
            if (!/^-?\d+(\.\d+)?$/.test(raw)) {
                return { ok: false, error: `${field.label} must be a number.` };
            }
            return { ok: true, value: Number(raw) };
        }

        case 'email': {
            const text = asText(value).trim().toLowerCase();
            if (text.length > 254 || !isValidEmail(text)) {
                return { ok: false, error: `${field.label} must be a valid email address.` };
            }
            return { ok: true, value: text };
        }

        case 'phone': {
            const text = asText(value).trim();
            if (!/^[+\d][\d\s()-]{5,24}$/.test(text)) {
                return { ok: false, error: `${field.label} must be a valid phone number.` };
            }
            return { ok: true, value: text };
        }

        case 'date': {
            const text = asText(value).trim();
            if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(Date.parse(text))) {
                return { ok: false, error: `${field.label} must be a valid date.` };
            }
            return { ok: true, value: text };
        }

        case 'singleChoice': {
            const text = asText(value).trim();
            if (!field.options?.includes(text)) {
                return { ok: false, error: `${field.label}: "${text}" is not an available option.` };
            }
            return { ok: true, value: text };
        }

        case 'multiChoice': {
            const list = Array.isArray(value) ? value : [value];
            const cleaned = list
                .map(v => String(v).trim())
                .filter(v => field.options?.includes(v));
            if (!cleaned.length) {
                return { ok: false, error: `${field.label}: pick at least one available option.` };
            }
            // De-duplicate while preserving the schema's option order.
            const ordered = field.options!.filter(o => cleaned.includes(o));
            return { ok: true, value: ordered };
        }

        case 'longText': {
            const text = asText(value).trim();
            if (text.length > MAX_LONG) {
                return { ok: false, error: `${field.label} must be ${MAX_LONG} characters or fewer.` };
            }
            return { ok: true, value: text };
        }

        case 'shortText':
        default: {
            const text = asText(value).trim();
            if (text.length > MAX_SHORT) {
                return { ok: false, error: `${field.label} must be ${MAX_SHORT} characters or fewer.` };
            }
            return { ok: true, value: text };
        }
    }
};

export interface SubmissionResult {
    ok: boolean;
    answers: Record<string, AnswerValue>;
    errors: Record<string, string>;
}

/**
 * Validate a whole submission against the stored schema. This is the authority:
 * the client re-validates for feedback, but only this result is trusted.
 */
export const validateSubmission = (
    fields: FormField[],
    rawAnswers: any
): SubmissionResult => {
    const answers: Record<string, AnswerValue> = {};
    const errors: Record<string, string> = {};
    const input = rawAnswers && typeof rawAnswers === 'object' ? rawAnswers : {};

    for (const field of fields) {
        const result = validateAnswer(field, input[field.id]);
        if (result.ok) answers[field.id] = result.value;
        else errors[field.id] = result.error;
    }

    return { ok: Object.keys(errors).length === 0, answers, errors };
};

export interface SubmitterContext {
    email?: string | null;
    affiliation?: 'zewail' | 'external' | null;
    role?: string | null;
    authenticated: boolean;
}

/**
 * Whether a submitter satisfies the form's audience gate. Mirrors what the
 * Firestore rules allow, but decided server-side from a verified token so it
 * cannot be spoofed by a crafted request body.
 */
export const audienceAllows = (audience: FormAudience, who: SubmitterContext): boolean => {
    switch (audience) {
        case 'public':
            return true;
        case 'university':
            return who.authenticated && !!who.affiliation;
        case 'zewail':
            return who.authenticated && who.affiliation === 'zewail';
        case 'members':
            return who.authenticated && (who.role === 'member' || who.role === 'admin');
        default:
            return false;
    }
};

export const AUDIENCE_LABELS: Record<FormAudience, string> = {
    public: 'Anyone (including guests)',
    university: 'Any Egyptian university account',
    zewail: 'Zewail City students only',
    members: 'AIAA Zewail City members only',
};
