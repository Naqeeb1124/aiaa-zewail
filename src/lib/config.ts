export const KICKOFF_MODE = false;

/**
 * Access tiers.
 *
 * - `zewail`   full member access: applications, interviews, projects, points, badges
 * - `external` public content plus their own event registrations
 *
 * Membership stays exclusive to Zewail City so points, badges and the
 * certificates derived from them stay meaningful.
 */
export type Affiliation = 'zewail' | 'external';

/** Zewail City student accounts live on this domain and use the `s-` prefix. */
export const INTERNAL_DOMAIN = 'zewailcity.edu.eg';
export const INTERNAL_EMAIL_PREFIX = 's-';

/**
 * Optional narrowing for the external tier. Leave empty to admit any well-formed
 * email address (open sign-up); list domains (e.g. ['aucegypt.edu',
 * 'zu.edu.eg']) to admit only those. Lowercase, and Zewail City students are
 * always admitted as members regardless.
 *
 * Admission is deliberately not tied to `.edu.eg`: AUC, for example, issues
 * `aucegypt.edu` addresses, so a `.edu.eg`-only gate locked their students out.
 */
export const EXTERNAL_DOMAIN_ALLOWLIST: string[] = [];

/** Loose shape check: local part, `@`, and a dotted domain, with no whitespace. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AffiliationResult {
    affiliation: Affiliation;
    email: string;
    domain: string;
    university: string;
}

/**
 * Single source of truth for "who may sign in, and as what".
 *
 * Open sign-up: any well-formed email address is admitted to the external tier,
 * and only Zewail City students (`s-…@zewailcity.edu.eg`) get member access.
 * EXTERNAL_DOMAIN_ALLOWLIST narrows admission again when populated.
 *
 * This is a convenience check for the UI only. Firestore rules re-derive the
 * tier from the verified ID token email, because the result of this function is
 * only ever as trustworthy as the client that called it.
 */
export const classifyEmail = (email: string | null | undefined): AffiliationResult | null => {
    const normalized = (email || '').trim().toLowerCase();
    if (!EMAIL_SHAPE.test(normalized)) return null;

    const at = normalized.lastIndexOf('@');
    const domain = normalized.slice(at + 1);

    // Members: only Zewail City student accounts. Staff and faculty share the
    // domain but lack the `s-` prefix, so they fall through to the external
    // tier instead of being denied.
    if (domain === INTERNAL_DOMAIN && normalized.startsWith(INTERNAL_EMAIL_PREFIX)) {
        return { affiliation: 'zewail', email: normalized, domain, university: 'Zewail City' };
    }

    // An empty allowlist admits every well-formed address. When populated it
    // must match exactly, or as a parent of a subdomain (e.g. 'zu.edu.eg'
    // admits 'eng.zu.edu.eg').
    if (EXTERNAL_DOMAIN_ALLOWLIST.length) {
        const permitted = EXTERNAL_DOMAIN_ALLOWLIST.some(
            allowed => domain === allowed || domain.endsWith(`.${allowed}`)
        );
        if (!permitted) return null;
    }

    return { affiliation: 'external', email: normalized, domain, university: domain };
};
