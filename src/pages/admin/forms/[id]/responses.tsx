import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
} from 'firebase/firestore';
import { db, auth } from '../../../../lib/firebase';
import { useAdmin } from '../../../../hooks/useAdmin';
import { useFormDoc } from '../../../../hooks/useFormDoc';
import SignedInGuard from '../../../../components/SignedInGuard';
import Navbar from '../../../../components/Navbar';
import { RESPONSE_STATUSES, type AnswerValue, type FormResponseWithId, type ResponseStatus } from '../../../../types/form';

const STATUS_STYLES: Record<ResponseStatus, string> = {
    new: 'bg-iris/15 text-iris border-iris/40',
    reviewed: 'bg-line text-ink-soft border-line',
    shortlisted: 'bg-growth/15 text-growth border-growth/40',
};

const display = (value: AnswerValue | undefined): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
};

export default function FormResponses() {
    const router = useRouter();
    const formId = typeof router.query.id === 'string' ? router.query.id : '';
    const { user } = useAdmin();
    const { form, loading, denied } = useFormDoc(formId);
    const [responses, setResponses] = useState<FormResponseWithId[]>([]);
    const [loadingRows, setLoadingRows] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        if (!formId || denied || !form) return;
        let cancelled = false;

        const q = query(
            collection(db, 'forms', formId, 'responses'),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(
            q,
            snap => {
                if (cancelled) return;
                setResponses(snap.docs.map(d => ({ id: d.id, ...d.data() } as FormResponseWithId)));
                setLoadingRows(false);
            },
            error => {
                console.error('Failed to load responses:', error);
                if (!cancelled) setLoadingRows(false);
            }
        );

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, [formId, denied, form]);

    // Notes are edited locally and flushed on blur, so a reviewer's cursor is
    // never yanked around mid-typing.
    const updateResponse = async (id: string, patch: Partial<FormResponseWithId>) => {
        setSavingId(id);
        try {
            const payload: any = { ...patch };
            if (patch.status) {
                payload.reviewedAt = new Date();
                payload.reviewedBy = user?.email || '';
            }
            await updateDoc(doc(db, 'forms', formId, 'responses', id), payload);
        } catch (error) {
            console.error('Failed to update response:', error);
            alert('Could not save that change.');
        } finally {
            setSavingId(null);
        }
    };

    const handleExport = async () => {
        if (!user) return;
        setExporting(true);
        try {
            const token = await user.getIdToken();
            const response = await fetch(`/api/admin/export-form-responses?formId=${encodeURIComponent(formId)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Export failed');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `form-responses-${formId}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            console.error('Export error:', error);
            alert(error.message);
        } finally {
            setExporting(false);
        }
    };

    if (loading || loadingRows) {
        return (
            <SignedInGuard>
                <div className="min-h-screen bg-ink text-white">
                    <Navbar />
                    <div className="pt-32 px-6 text-ink-muted animate-pulse">Loading responses[..]</div>
                </div>
            </SignedInGuard>
        );
    }

    if (denied || !form) {
        return (
            <SignedInGuard>
                <div className="min-h-screen bg-ink text-white">
                    <Navbar />
                    <div className="pt-32 px-6 max-w-3xl mx-auto">
                        <h1 className="text-2xl font-bold">No access</h1>
                        <p className="text-ink-muted mt-3">
                            This form does not exist, or you are not its owner.
                        </p>
                        <Link href="/admin/forms" className="inline-block mt-6 px-6 py-3 border border-line hover:border-growth">
                            Back to forms
                        </Link>
                    </div>
                </div>
            </SignedInGuard>
        );
    }

    return (
        <SignedInGuard>
            <div className="min-h-screen bg-ink text-white">
                <Navbar />
                <div className="pt-32 px-6 max-w-6xl mx-auto pb-24">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold">Responses</h1>
                            <p className="text-ink-muted mt-2">{form.title}</p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/admin/forms" className="px-5 py-2 border border-line hover:border-growth text-sm">
                                All forms
                            </Link>
                            <Link
                                href={`/admin/forms/${formId}`}
                                className="px-5 py-2 border border-line hover:border-growth text-sm"
                            >
                                Edit form
                            </Link>
                            <button
                                type="button"
                                onClick={handleExport}
                                disabled={exporting || responses.length === 0}
                                className="px-5 py-2 bg-growth text-white text-sm font-bold hover:bg-signal-soft disabled:opacity-50"
                            >
                                {exporting ? 'Exporting...' : 'Export CSV'}
                            </button>
                        </div>
                    </div>

                    <p className="text-ink-muted text-sm mb-8">
                        {responses.length} response{responses.length === 1 ? '' : 's'}. Answers are read-only; only
                        status and notes can be changed.
                    </p>

                    {responses.length === 0 ? (
                        <p className="text-ink-muted">No responses yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {responses.map(response => (
                                <div key={response.id} className="border border-line p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                                        <div className="min-w-0">
                                            <p className="font-bold">{response.submitter?.name || 'Anonymous'}</p>
                                            <p className="text-ink-muted text-sm mt-1 break-all">
                                                {response.submitter?.email}
                                                {response.submitter?.university ? ` · ${response.submitter.university}` : ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {savingId === response.id && (
                                                <span className="text-ink-muted text-xs">Saving...</span>
                                            )}
                                            <select
                                                value={response.status || 'new'}
                                                onChange={e =>
                                                    updateResponse(response.id, {
                                                        status: e.target.value as ResponseStatus,
                                                    })
                                                }
                                                className="bg-ink border border-line px-3 py-2 text-sm focus:border-growth outline-none"
                                            >
                                                {RESPONSE_STATUSES.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-5">
                                        {form.fields.map(field => (
                                            <div key={field.id}>
                                                <dt className="text-ink-muted text-xs uppercase tracking-wider">
                                                    {field.label}
                                                </dt>
                                                <dd className="text-white mt-1 text-sm break-words">
                                                    {display(response.answers?.[field.id])}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>

                                    <div>
                                        <label className="block text-ink-muted text-xs uppercase tracking-wider mb-2">
                                            Notes
                                        </label>
                                        <textarea
                                            rows={2}
                                            defaultValue={response.notes || ''}
                                            onBlur={e => {
                                                if (e.target.value !== (response.notes || '')) {
                                                    updateResponse(response.id, { notes: e.target.value });
                                                }
                                            }}
                                            className="w-full bg-ink border border-line px-4 py-3 text-white text-sm focus:border-growth outline-none"
                                            placeholder="Private notes for the review team."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SignedInGuard>
    );
}
