import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { collection, getDocs, orderBy, query, serverTimestamp, addDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAdmin } from '../../../hooks/useAdmin';
import SignedInGuard from '../../../components/SignedInGuard';
import Navbar from '../../../components/Navbar';
import { AUDIENCE_LABELS } from '../../../lib/forms';
import type { FormAudience, FormDocWithId } from '../../../types/form';

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-line text-ink-soft border-line',
    published: 'bg-growth/15 text-growth border-growth/40',
    closed: 'bg-ember/15 text-ember border-ember/40',
};

export default function FormsList() {
    const router = useRouter();
    const { user, isAdmin } = useAdmin();
    const [forms, setForms] = useState<FormDocWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [audience, setAudience] = useState<FormAudience>('public');

    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        (async () => {
            try {
                // Rules filter this per document: admins and owners see their
                // own drafts, everyone else only published forms.
                const q = query(collection(db, 'forms'), orderBy('createdAt', 'desc'));
                const snap = await getDocs(q);
                if (cancelled) return;
                setForms(snap.docs.map(d => ({ id: d.id, ...d.data() } as FormDocWithId)));
            } catch (error) {
                console.error('Failed to load forms:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !user) return;
        setCreating(true);
        try {
            const ref = await addDoc(collection(db, 'forms'), {
                title: title.trim(),
                description: '',
                status: 'draft',
                audience,
                fields: [],
                createdBy: user.uid,
                createdByEmail: user.email || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            router.push(`/admin/forms/${ref.id}`);
        } catch (error) {
            console.error('Failed to create form:', error);
            alert('Could not create the form.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <SignedInGuard>
            <div className="min-h-screen bg-ink text-white">
                <Navbar />
                <div className="pt-32 px-6 max-w-5xl mx-auto pb-24">
                    <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
                        <div>
                            <h1 className="text-3xl font-bold">Forms</h1>
                            <p className="text-ink-muted mt-2 max-w-2xl">
                                Build surveys and questionnaires. You own the forms you create, and you and the
                                admins can review their responses.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleCreate} className="bg-ink border border-line p-6 md:p-8 mb-12 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-ink-muted mb-2 text-sm">Form title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-ink border border-line px-4 py-3 text-white focus:border-growth outline-none"
                                    placeholder="e.g., Workshop Feedback"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-ink-muted mb-2 text-sm">Who can respond</label>
                                <select
                                    value={audience}
                                    onChange={e => setAudience(e.target.value as FormAudience)}
                                    className="w-full bg-ink border border-line px-4 py-3 text-white focus:border-growth outline-none"
                                >
                                    {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={creating || !title.trim()}
                            className="px-8 py-3 bg-growth text-white font-bold hover:bg-signal-soft transition-colors disabled:opacity-50"
                        >
                            {creating ? 'Creating...' : 'Create draft form'}
                        </button>
                    </form>

                    {loading ? (
                        <p className="text-ink-muted animate-pulse">Loading forms[..]</p>
                    ) : forms.length === 0 ? (
                        <p className="text-ink-muted">
                            No forms yet. Create one above, or note that published forms made by others appear here too.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {forms.map(form => {
                                const mine = form.createdBy === user?.uid;
                                const manageable = mine || isAdmin;
                                return (
                                    <div key={form.id} className="bg-ink border border-line p-6 flex flex-wrap items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h2 className="font-bold text-lg truncate">{form.title}</h2>
                                                <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${STATUS_STYLES[form.status] || ''}`}>
                                                    {form.status}
                                                </span>
                                                {!mine && (
                                                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 border border-line text-ink-muted">
                                                        {isAdmin ? 'all forms' : 'published'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-ink-muted text-sm mt-2">
                                                {form.fields?.length || 0} question{form.fields?.length === 1 ? '' : 's'} &middot;{' '}
                                                {AUDIENCE_LABELS[form.audience]}
                                            </p>
                                        </div>
                                        {manageable && (
                                            <div className="flex gap-3">
                                                <Link
                                                    href={`/admin/forms/${form.id}`}
                                                    className="px-4 py-2 border border-line hover:border-growth text-sm"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={`/admin/forms/${form.id}/responses`}
                                                    className="px-4 py-2 bg-growth text-white text-sm font-bold hover:bg-signal-soft"
                                                >
                                                    Responses
                                                </Link>
                                                {form.status === 'published' && (
                                                    <a
                                                        href={`/forms/${form.id}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-4 py-2 border border-line hover:border-growth text-sm"
                                                    >
                                                        View
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </SignedInGuard>
    );
}
