import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { classifyEmail, type AffiliationResult } from '../lib/config';

/**
 * Resolves the signed-in user's access tier from their verified token email.
 *
 * This mirrors the check in firestore.rules, which re-derives the tier from that
 * same signed token. Never read the tier off the user document instead: that
 * field is client-writable, so the UI would render membership screens for an
 * account the rules then reject with a raw permission error.
 */
export function useAffiliation() {
    const [identity, setIdentity] = useState<AffiliationResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return onAuthStateChanged(auth, (user) => {
            setIdentity(classifyEmail(user?.email));
            setLoading(false);
        });
    }, []);

    return { identity, loading };
}
