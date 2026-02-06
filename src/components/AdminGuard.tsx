import { useAdmin } from '../hooks/useAdmin';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { isAdmin, loading, user } = useAdmin();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/join');
            } else if (!isAdmin) {
                router.push('/');
            }
        }
    }, [user, isAdmin, loading, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">Loading...</div>;
    
    if (!isAdmin) return null;

    return <>{children}</>;
}
