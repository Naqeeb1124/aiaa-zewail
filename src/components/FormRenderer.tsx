import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { audienceAllows } from '../lib/forms';
import type { AnswerValue, FormDoc, FormField } from '../types/form';

interface FormRendererProps {
    formId: string;
    form: FormDoc;
}

const inputClasses =
    'w-full px-5 py-3.5 bg-paper border border-line focus:border-iris focus:ring-2 focus:ring-iris/20 outline-none duration-base ease-human text-ink placeholder:text-ink-muted font-medium';
const labelClasses = 'block eyebrow text-ink-muted mb-2';

export default function FormRenderer({ formId, form }: FormRendererProps) {
    const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [university, setUniversity] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    // Honeypot: hidden from users, tempting to bots.
    const [website, setWebsite] = useState('');
    const startedAt = useRef(Date.now());
    const [authEmail, setAuthEmail] = useState<string | null>(null);

    useEffect(() => {
        startedAt.current = Date.now();
        return onAuthStateChanged(auth, (user) => {
            setAuthEmail(user?.email ?? null);
            if (user) {
                setName((prev) => prev || user.displayName || '');
                setEmail((prev) => prev || user.email || '');
            }
        });
    }, []);

    const setAnswer = (id: string, value: AnswerValue) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
        setErrors(prev => {
            if (!prev[id]) return prev;
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const toggleMulti = (field: FormField, option: string) => {
        const current = Array.isArray(answers[field.id]) ? (answers[field.id] as string[]) : [];
        setAnswer(
            field.id,
            current.includes(option) ? current.filter(o => o !== option) : [...current, option]
        );
    };

    const renderField = (field: FormField) => {
        const err = errors[field.id];
        const value = answers[field.id];

        switch (field.type) {
            case 'longText':
                return (
                    <textarea
                        rows={4}
                        value={(value as string) || ''}
                        onChange={e => setAnswer(field.id, e.target.value)}
                        className={inputClasses}
                        required={field.required}
                    />
                );
            case 'email':
                return (
                    <input
                        type="email"
                        value={(value as string) || ''}
                        onChange={e => setAnswer(field.id, e.target.value)}
                        className={inputClasses}
                        required={field.required}
                    />
                );
            case 'phone':
                return (
                    <input
                        type="tel"
                        value={(value as string) || ''}
                        onChange={e => setAnswer(field.id, e.target.value)}
                        className={inputClasses}
                        required={field.required}
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={value === null || value === undefined ? '' : String(value)}
                        onChange={e => setAnswer(field.id, e.target.value)}
                        className={inputClasses}
                        required={field.required}
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={(value as string) || ''}
                        onChange={e => setAnswer(field.id, e.target.value)}
                        className={inputClasses}
                        required={field.required}
                    />
                );
            case 'yesNo':
                return (
                    <div className="flex gap-3">
                        {['Yes', 'No'].map(option => {
                            const selected = value === (option === 'Yes');
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setAnswer(field.id, option === 'Yes')}
                                    className={`px-6 py-3 eyebrow border duration-base ease-human ${
                                        selected
                                            ? 'bg-deep text-white border-deep'
                                            : 'bg-paper text-ink-soft border-line hover:border-deep hover:text-deep'
                                    }`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                );
            case 'singleChoice':
                return (
                    <div className="space-y-2">
                        {(field.options || []).map(option => {
                            const selected = value === option;
                            return (
                                <label
                                    key={option}
                                    className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-colors ${
                                        selected ? 'border-deep bg-canvas' : 'border-line hover:border-deep'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={field.id}
                                        checked={selected}
                                        onChange={() => setAnswer(field.id, option)}
                                        className="accent-[#1b2a4a]"
                                    />
                                    <span className="text-ink text-[14.5px]">{option}</span>
                                </label>
                            );
                        })}
                    </div>
                );
            case 'multiChoice':
                return (
                    <div className="flex flex-wrap gap-2.5">
                        {(field.options || []).map(option => {
                            const current = Array.isArray(value) ? (value as string[]) : [];
                            const selected = current.includes(option);
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => toggleMulti(field, option)}
                                    className={`px-4 py-2 eyebrow duration-base ease-human border ${
                                        selected
                                            ? 'bg-deep text-white border-deep'
                                            : 'bg-paper text-ink-soft border-line hover:border-deep hover:text-deep'
                                    }`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                );
            case 'shortText':
            default:
                return (
                    <input
                        type="text"
                        value={(value as string) || ''}
                        onChange={e => setAnswer(field.id, e.target.value)}
                        className={inputClasses}
                        required={field.required}
                    />
                );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        setMessage(null);
        setErrors({});

        try {
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
            const response = await fetch('/api/forms/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    formId,
                    answers,
                    name,
                    email: authEmail || email,
                    university,
                    website,
                    startedAt: startedAt.current,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                setDone(true);
                setMessage(data.message || 'Thanks — your response is in.');
                return;
            }

            if (data.errors && typeof data.errors === 'object') {
                setErrors(data.errors);
                setMessage(data.message || 'Please fix the highlighted fields.');
            } else {
                setMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch {
            setMessage('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (form.status === 'closed') {
        return (
            <div className="card p-7 md:p-12 text-center">
                <h2 className="font-display text-2xl font-semibold text-ink">This form is closed</h2>
                <p className="mt-3 text-ink-soft">Responses are no longer being accepted.</p>
            </div>
        );
    }

    const eligible = audienceAllows(form.audience, {
        email: authEmail,
        affiliation: authEmail?.endsWith('zewailcity.edu.eg') ? 'zewail' : authEmail ? 'external' : null,
        authenticated: !!authEmail,
        role: null,
    });

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot: kept out of the tab order and off-screen. */}
            <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label htmlFor={`${formId}-website`}>Website</label>
                <input
                    id={`${formId}-website`}
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                />
            </div>

            {/* Identity: only the submit endpoint trusts these, and only for guests. */}
            {!authEmail && (
                <section className="card p-6 md:p-9">
                    <h2 className="font-display font-semibold text-[1.35rem] text-ink">About you</h2>
                    <p className="text-[14.5px] text-ink-soft mt-2">
                        So we can follow up if we have a question about your response.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                        <div>
                            <label className={labelClasses} htmlFor={`${formId}-name`}>Name</label>
                            <input
                                id={`${formId}-name`}
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClasses} htmlFor={`${formId}-email`}>Email</label>
                            <input
                                id={`${formId}-email`}
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClasses} htmlFor={`${formId}-university`}>University</label>
                            <input
                                id={`${formId}-university`}
                                type="text"
                                value={university}
                                onChange={e => setUniversity(e.target.value)}
                                className={inputClasses}
                                placeholder="Where are you studying?"
                            />
                        </div>
                    </div>
                </section>
            )}

            {form.fields.length === 0 && (
                <div className="card p-6 text-ink-soft">This form has no questions yet.</div>
            )}

            {form.fields.map(field => (
                <section key={field.id} className="card p-6 md:p-9">
                    <label className={labelClasses} htmlFor={`${formId}-${field.id}`}>
                        {field.label}
                        {field.required && <span className="text-ember ml-1">*</span>}
                    </label>
                    {field.help && <p className="text-[13.5px] text-ink-muted mt-1 mb-3">{field.help}</p>}
                    <div className={field.help ? '' : 'mt-3'}>{renderField(field)}</div>
                    {errors[field.id] && <p className="text-ember text-[13px] mt-2">{errors[field.id]}</p>}
                </section>
            ))}

            {!eligible && (
                <div className="card p-5 border-ember/50 bg-ember/5">
                    <p className="text-ink-soft text-[14px]">
                        This form is restricted. Sign in with an eligible account before submitting.
                    </p>
                </div>
            )}

            {message && (
                <div
                    className={`card p-5 ${done ? 'border-growth/50 bg-growth/5' : 'border-ember/50 bg-ember/5'}`}
                >
                    <p className="text-ink text-[14.5px]">{message}</p>
                </div>
            )}

            {form.audience !== 'public' && !authEmail && (
                <p className="text-ink-muted text-[13.5px]">
                    <Link href="/join" className="underline">Sign in</Link> to submit this form.
                </p>
            )}

            <button type="submit" disabled={submitting || !eligible} className="btn btn-primary w-full justify-center">
                {submitting ? 'Sending...' : 'Submit response'}
            </button>
        </form>
    );
}
