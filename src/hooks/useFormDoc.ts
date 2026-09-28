import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAdmin } from './useAdmin';
import type { FormDoc } from '../types/form';

/**
 * Loads a form and resolves whether the signed-in user may manage it.
 *
 * The Firestore rules are the real gate; this only keeps the page from
 * rendering an editor that would fail on the first write.
 */
export function useFormDoc(formId: string) {
    const { user, isAdmin, loading: authLoading } = useAdmin();
    const [form, setForm] = useState<FormDoc | null>(null);
    const [loading, setLoading] = useState(true);
    const [denied, setDenied] = useState(false);

    useEffect(() => {
        if (!formId || !user) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const snap = await getDoc(doc(db, 'forms', formId));
                if (cancelled) return;
                if (!snap.exists()) {
                    setDenied(true);
                    return;
                }
                const data = snap.data() as FormDoc;
                setForm(data);
                setDenied(!isAdmin && data.createdBy !== user.uid);
            } catch {
                if (!cancelled) setDenied(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [formId, user, isAdmin]);

    return {
        form,
        loading: loading || authLoading,
        denied,
        isOwner: !!user && !!form && form.createdBy === user.uid,
    };
}
