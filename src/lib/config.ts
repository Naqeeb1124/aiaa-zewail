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
 * Every other Egyptian university. Zewail City matches this suffix too, so it
 * is classified first and never lands in the external tier.
 *
 * This is a weak signal: it proves the address is a real Egyptian university
 * mailbox, not that the holder is a student. That is acceptable for the current
 * external scope (browse + event registration) and no more.
 */
export const EXTERNAL_DOMAIN_SUFFIX = '.edu.eg';

/**
 * Optional narrowing for the external tier. Leave empty to admit any Egyptian
 * university; list domains (e.g. ['eng.zu.edu.eg', 'auc.edu.eg']) to admit only
 * those. Lowercase, and Zewail City is always admitted as a member regardless.
 *
 * Populate this before extending external access to anything worth protecting.
 */
export const EXTERNAL_DOMAIN_ALLOWLIST: string[] = [];

export interface AffiliationResult {
    affiliation: Affiliation;
    email: string;
    domain: string;
    university: string;
}

/**
 * Single source of truth for "who may sign in, and as what".
 *
 * This is a convenience check for the UI only. Firestore rules re-derive the
 * tier from the verified ID token email, because the result of this function is
 * only ever as trustworthy as the client that called it.
 */
export const classifyEmail = (email: string | null | undefined): AffiliationResult | null => {
    const normalized = (email || '').trim().toLowerCase();
    const at = normalized.lastIndexOf('@');
    if (at < 1) return null;

    const domain = normalized.slice(at + 1);
    if (!domain) return null;

    if (domain === INTERNAL_DOMAIN) {
        // Staff and faculty accounts share the domain but are not members.
        if (!normalized.startsWith(INTERNAL_EMAIL_PREFIX)) return null;
        return { affiliation: 'zewail', email: normalized, domain, university: 'Zewail City' };
    }

    if (domain.endsWith(EXTERNAL_DOMAIN_SUFFIX)) {
        // An empty allowlist admits every Egyptian university. When populated it
        // must match exactly, or as a parent of a subdomain (e.g. 'zu.edu.eg'
        // admits 'eng.zu.edu.eg').
        if (EXTERNAL_DOMAIN_ALLOWLIST.length) {
            const permitted = EXTERNAL_DOMAIN_ALLOWLIST.some(
                allowed => domain === allowed || domain.endsWith(`.${allowed}`)
            );
            if (!permitted) return null;
        }
        return { affiliation: 'external', email: normalized, domain, university: domain };
    }

    return null;
};
