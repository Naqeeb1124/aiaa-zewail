import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FormRenderer from '../../components/FormRenderer';
import type { FormDoc } from '../../types/form';

export default function PublicForm() {
    const router = useRouter();
    const formId = typeof router.query.id === 'string' ? router.query.id : '';
    const [form, setForm] = useState<FormDoc | null>(null);
    const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

    useEffect(() => {
        if (!formId) return;
        let cancelled = false;

        (async () => {
            try {
                // Draft and closed forms are not readable by the public, so a
                // permission error here is an expected "not available" outcome.
                const snap = await getDoc(doc(db, 'forms', formId));
                if (cancelled) return;
                if (snap.exists()) {
                    setForm(snap.data() as FormDoc);
                    setState('ready');
                } else {
                    setState('missing');
                }
            } catch {
                if (!cancelled) setState('missing');
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [formId]);

    return (
        <div className="min-h-screen paper-surface text-ink">
            <Navbar />
            <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
                {state === 'loading' && (
                    <p className="text-center py-12 text-ink-muted eyebrow animate-pulse">Loading form[..]</p>
                )}

                {state === 'missing' && (
                    <div className="card p-7 md:p-12 text-center">
                        <h1 className="font-display text-2xl font-semibold text-ink">Form unavailable</h1>
                        <p className="mt-3 text-ink-soft">
                            This form does not exist, or it is not open to the public yet.
                        </p>
                        <Link href="/events" className="btn btn-primary mt-6 inline-flex">Browse events</Link>
                    </div>
                )}

                {state === 'ready' && form && (
                    <>
                        <div className="mb-10">
                            <span className="eyebrow text-iris">Form</span>
                            <h1 className="mt-3 font-display text-[clamp(1.9rem,5vw,3rem)] font-semibold tracking-tight leading-[1.05]">
                                {form.title}
                            </h1>
                            {form.description && (
                                <p className="mt-4 text-[15.5px] text-ink-soft leading-relaxed">
                                    {form.description}
                                </p>
                            )}
                        </div>

                        {form.status === 'published' ? (
                            <FormRenderer formId={formId} form={form} />
                        ) : (
                            <div className="card p-7 text-center">
                                <p className="text-ink-soft">
                                    This form is {form.status === 'draft' ? 'still being prepared' : 'closed'} and is not accepting responses.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
