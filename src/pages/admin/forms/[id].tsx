import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAdmin } from '../../../hooks/useAdmin';
import { useFormDoc } from '../../../hooks/useFormDoc';
import SignedInGuard from '../../../components/SignedInGuard';
import Navbar from '../../../components/Navbar';
import { AUDIENCE_LABELS, newFieldId, normalizeFields, typeNeedsOptions } from '../../../lib/forms';
import { FIELD_TYPES, type FieldType, FormAudience, FormDoc, FormField, FormStatus } from '../../../types/form';

const inputClasses = 'w-full bg-ink border border-line px-4 py-3 text-white focus:border-growth outline-none';
const labelClasses = 'block text-ink-muted mb-2 text-sm';

export default function FormBuilder() {
    const router = useRouter();
    const formId = typeof router.query.id === 'string' ? router.query.id : '';
    const { isAdmin } = useAdmin();
    const { form, loading, denied } = useFormDoc(formId);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [audience, setAudience] = useState<FormAudience>('public');
    const [status, setStatus] = useState<FormStatus>('draft');
    const [fields, setFields] = useState<FormField[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!form) return;
        setTitle(form.title || '');
        setDescription(form.description || '');
        setAudience(form.audience || 'public');
        setStatus(form.status || 'draft');
        setFields(Array.isArray(form.fields) ? form.fields : []);
    }, [form]);

    useEffect(() => {
        if (!saving) setSaved(false);
    }, [fields, title, description, audience, status, saving]);

    if (loading) {
        return (
            <SignedInGuard>
                <div className="min-h-screen bg-ink text-white">
                    <Navbar />
                    <div className="pt-32 px-6 text-ink-muted animate-pulse">Loading form[..]</div>
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

    const addField = () => {
        setFields(prev => [
            ...prev,
            { id: newFieldId(), type: 'shortText', label: '', required: false },
        ]);
    };

    const patchField = (id: string, patch: Partial<FormField>) => {
        setFields(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));
    };

    const moveField = (index: number, delta: number) => {
        setFields(prev => {
            const next = [...prev];
            const target = index + delta;
            if (target < 0 || target >= next.length) return prev;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const removeField = (id: string) => {
        setFields(prev => prev.filter(f => f.id !== id));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Blank labels are dropped and options are cleaned, so a malformed
            // schema can never reach the submit endpoint.
            const cleanFields = normalizeFields(fields);
            await updateDoc(doc(db, 'forms', formId), {
                title: title.trim(),
                description: description.trim(),
                audience,
                status,
                fields: cleanFields,
                updatedAt: serverTimestamp(),
            });
            setFields(cleanFields);
            setSaved(true);
        } catch (error) {
            console.error('Failed to save form:', error);
            alert('Could not save the form.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this form and all of its responses? This cannot be undone.')) return;
        try {
            await deleteDoc(doc(db, 'forms', formId));
            router.push('/admin/forms');
        } catch (error) {
            console.error('Failed to delete form:', error);
            alert('Could not delete the form. Only admins can delete forms.');
        }
    };

    return (
        <SignedInGuard>
            <div className="min-h-screen bg-ink text-white">
                <Navbar />
                <div className="pt-32 px-6 max-w-4xl mx-auto pb-24">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <h1 className="text-3xl font-bold">Edit form</h1>
                        <div className="flex gap-3">
                            <Link href="/admin/forms" className="px-5 py-2 border border-line hover:border-growth text-sm">
                                All forms
                            </Link>
                            <Link
                                href={`/admin/forms/${formId}/responses`}
                                className="px-5 py-2 bg-growth text-white text-sm font-bold hover:bg-signal-soft"
                            >
                                Responses
                            </Link>
                            {status === 'published' && (
                                <a
                                    href={`/forms/${formId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-5 py-2 border border-line hover:border-growth text-sm"
                                >
                                    View
                                </a>
                            )}
                        </div>
                    </div>

                    <section className="border border-line p-6 md:p-8 space-y-5 mb-8">
                        <div>
                            <label className={labelClasses} htmlFor="form-title">Title</label>
                            <input
                                id="form-title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClasses} htmlFor="form-desc">Description</label>
                            <textarea
                                id="form-desc"
                                rows={3}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className={inputClasses}
                                placeholder="Optional intro shown above the questions."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClasses} htmlFor="form-audience">Who can respond</label>
                                <select
                                    id="form-audience"
                                    value={audience}
                                    onChange={e => setAudience(e.target.value as FormAudience)}
                                    className={inputClasses}
                                >
                                    {Object.entries(AUDIENCE_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses} htmlFor="form-status">Status</label>
                                <select
                                    id="form-status"
                                    value={status}
                                    onChange={e => setStatus(e.target.value as FormStatus)}
                                    className={inputClasses}
                                >
                                    <option value="draft">Draft — not visible to anyone</option>
                                    <option value="published">Published — accepting responses</option>
                                    <option value="closed">Closed — visible but not accepting</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Questions</h2>
                        <button
                            type="button"
                            onClick={addField}
                            className="px-5 py-2 border border-line hover:border-growth text-sm"
                        >
                            Add question
                        </button>
                    </div>

                    {fields.length === 0 && (
                        <p className="text-ink-muted mb-6">
                            No questions yet. Add one to get started.
                        </p>
                    )}

                    <div className="space-y-4 mb-8">
                        {fields.map((field, index) => (
                            <div key={field.id} className="border border-line p-5 space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-ink-muted text-sm w-6">{index + 1}</span>
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={e => patchField(field.id, { label: e.target.value })}
                                        className={`${inputClasses} flex-1 min-w-[12rem]`}
                                        placeholder="Question label"
                                    />
                                    <select
                                        value={field.type}
                                        onChange={e => {
                                            const type = e.target.value as FieldType;
                                            patchField(field.id, {
                                                type,
                                                options: typeNeedsOptions(type) ? field.options || [''] : undefined,
                                            });
                                        }}
                                        className={`${inputClasses} w-auto`}
                                    >
                                        {FIELD_TYPES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <input
                                    type="text"
                                    value={field.help || ''}
                                    onChange={e => patchField(field.id, { help: e.target.value })}
                                    className={inputClasses}
                                    placeholder="Helper text (optional)"
                                />

                                {typeNeedsOptions(field.type) && (
                                    <div>
                                        <label className={labelClasses}>Options (one per line)</label>
                                        <textarea
                                            rows={4}
                                            value={(field.options || []).join('\n')}
                                            onChange={e =>
                                                patchField(field.id, {
                                                    options: e.target.value.split('\n').map(o => o.trim()).filter(Boolean),
                                                })
                                            }
                                            className={inputClasses}
                                            placeholder={'Option A\nOption B'}
                                        />
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <label className="flex items-center gap-2 text-sm text-ink-muted">
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={e => patchField(field.id, { required: e.target.checked })}
                                            className="w-4 h-4 accent-[#1b2a4a]"
                                        />
                                        Required
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => moveField(index, -1)}
                                            disabled={index === 0}
                                            className="px-3 py-1 border border-line text-xs disabled:opacity-30 hover:border-growth"
                                        >
                                            Up
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveField(index, 1)}
                                            disabled={index === fields.length - 1}
                                            className="px-3 py-1 border border-line text-xs disabled:opacity-30 hover:border-growth"
                                        >
                                            Down
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeField(field.id)}
                                            className="px-3 py-1 border border-ember/50 text-xs text-ember hover:bg-ember/10"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-line">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !title.trim()}
                            className="px-8 py-3 bg-growth text-white font-bold hover:bg-signal-soft disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save form'}
                        </button>
                        {saved && <span className="text-sm text-growth">Saved.</span>}
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-5 py-3 border border-ember/50 text-ember hover:bg-ember/10"
                            >
                                Delete form
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </SignedInGuard>
    );
}
