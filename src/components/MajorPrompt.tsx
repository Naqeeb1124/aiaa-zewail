import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { AUC_NAME, AUC_UNDERGRAD_PROGRAMS, isAucEmail } from '../lib/majors';

/**
 * Personalized welcome for AUC visitors.
 *
 * External sign-up is open to every university, but only AUC students are
 * asked for a major, because only their undergraduate program list is curated
 * in src/lib/majors.ts. The pick lands on users/{uid}.major, which is safe to
 * write from the client because `major` grants no privileges — firestore.rules
 * only protects role/points/badges. Admins can already see it in the user
 * CSV export.
 *
 * Renders nothing for anyone who is not on an @aucegypt.edu account, so other
 * universities keep the generic visitor copy.
 */
export default function MajorPrompt({
    email,
    displayName,
}: {
    email?: string | null;
    displayName?: string | null;
}) {
    const [firstName, setFirstName] = useState('');
    const [major, setMajor] = useState('');
    const [draft, setDraft] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!isAucEmail(email)) {
                setLoading(false);
                return;
            }

            setFirstName(guessFirstName(email, displayName));

            const uid = auth.currentUser?.uid;
            if (!uid) {
                setLoading(false);
                return;
            }

            try {
                const snap = await getDoc(doc(db, 'users', uid));
                if (cancelled) return;
                const data = snap.data();
                if (typeof data?.firstName === 'string' && data.firstName.trim()) {
                    setFirstName(data.firstName.trim());
                }
                if (typeof data?.major === 'string' && data.major) {
                    setMajor(data.major);
                    setDraft(data.major);
                }
            } catch (error) {
                console.error('Could not load your profile:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [email, displayName]);

    const save = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid || !draft || saving) return;
        setSaving(true);
        try {
            await setDoc(
                doc(db, 'users', uid),
                { major: draft, majorUpdatedAt: serverTimestamp() },
                { merge: true }
            );
            setMajor(draft);
        } catch (error) {
            console.error('Could not save your major:', error);
            alert('Could not save your major. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!isAucEmail(email)) return null;
    if (loading) return null;

    return (
        <div className="text-center border-b border-line pb-8 mb-8">
            <div className="mx-auto mb-5 w-16 h-16 flex items-center justify-center text-2xl bg-iris-soft text-iris ring-1 ring-iris/30">
                👋
            </div>
            <h2 className="font-display text-[1.6rem] md:text-[2rem] font-semibold text-ink leading-tight">
                Hi {firstName}, welcome aboard.
            </h2>

            {major ? (
                <>
                    <p className="mt-3 lead mx-auto">
                        You&apos;re set — <strong className="text-ink">{major}</strong> at {AUC_NAME}.
                    </p>
                    <p className="mt-4 eyebrow text-ink-muted">Saved to your profile</p>
                </>
            ) : (
                <>
                    <p className="mt-3 lead mx-auto">
                        What are you studying at {AUC_NAME}? We ask so we can point you at the
                        right events and projects.
                    </p>
                    <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
                        <label className="sr-only" htmlFor="auc-major">Major</label>
                        <select
                            id="auc-major"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            className="flex-1 border border-line bg-paper px-4 py-3 text-ink"
                        >
                            <option value="">Pick your bachelor&apos;s program</option>
                            {AUC_UNDERGRAD_PROGRAMS.map((program) => (
                                <option key={program} value={program}>{program}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={save}
                            disabled={!draft || saving}
                            className="btn btn-primary disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save my major'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

/**
 * Best-effort first name for the greeting: the profile is authoritative, then
 * the Google display name, and finally the local part of the email
 * (`omar_hamza@…` → `Omar`).
 */
const guessFirstName = (email?: string | null, displayName?: string | null): string => {
    const fromDisplay = (displayName || '').trim().split(/\s+/)[0];
    if (fromDisplay && !fromDisplay.includes('@')) return fromDisplay;

    const local = (email || '').split('@')[0];
    const word = local.split(/[._\-+]/).filter(Boolean)[0] || '';
    return word ? word.charAt(0).toUpperCase() + word.slice(1) : 'there';
};
