import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdmin } from '../hooks/useAdmin';

/**
 * Requires a signed-in student, not an admin.
 *
 * Form owners are ordinary Zewail members, so the admin-only guard would lock
 * them out of the forms they created. Per-form permissions are then resolved
 * by useFormDoc and enforced by Firestore rules.
 */
export default function SignedInGuard({ children }: { children: React.ReactNode }) {
    const { isAdmin, loading, user } = useAdmin();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/join');
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-ink text-ink-muted">Loading...</div>;
    }

    if (!user) return null;

    return <>{children}</>;
}
