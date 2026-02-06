import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db, auth } from '../../../lib/firebase';
import { doc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Link from 'next/link';

export default function AutoCheckIn() {
    const router = useRouter();
    const { id } = router.query;
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not_registered' | 'unauthorized'>('loading');
    const [eventName, setEventName] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!id) return;

            if (!user) {
                setStatus('unauthorized');
                return;
            }

            try {
                // 1. Find the registration for this user and event
                const q = query(
                    collection(db, 'registrations'),
                    where('eventId', '==', id),
                    where('userId', '==', user.uid)
                );
                
                const snap = await getDocs(q);

                if (snap.empty) {
                    setStatus('not_registered');
                    return;
                }

                const regDoc = snap.docs[0];
                
                // 2. Update status to 'attended'
                await updateDoc(doc(db, 'registrations', regDoc.id), {
                    status: 'attended',
                    checkedInAt: new Date().toISOString()
                });

                setStatus('success');
            } catch (error) {
                console.error("Check-in error:", error);
                setStatus('error');
            }
        });

        return () => unsubscribe();
    }, [id]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-grow flex items-center justify-center p-6 pt-32 md:pt-72">
                <div className="max-w-md w-full bg-white rounded-[40px] shadow-xl p-10 border border-slate-100 text-center">
                    {status === 'loading' && (
                        <div className="py-12">
                            <div className="w-16 h-16 border-4 border-slate-100 border-t-featured-blue rounded-full animate-spin mx-auto mb-6"></div>
                            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">Verifying Credentials</h1>
                            <p className="text-slate-500 mt-2 font-medium">Please wait while we log your attendance...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-8 animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">✓</div>
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Check-in Success!</h1>
                            <p className="text-slate-500 mt-4 font-medium text-lg leading-relaxed">Welcome to the event! Your attendance has been officially recorded.</p>
                            <button onClick={() => router.push('/dashboard')} className="mt-10 w-full py-4 bg-featured-blue text-white rounded-full font-black uppercase tracking-widest text-xs shadow-lg hover:bg-featured-green transition-all transform hover:-translate-y-0.5">Go to My Dashboard</button>
                        </div>
                    )}

                    {status === 'not_registered' && (
                        <div className="py-8">
                            <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">!</div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No Registration Found</h1>
                            <p className="text-slate-500 mt-4 font-medium leading-relaxed">It looks like you haven&apos;t registered for this event yet. Please register first to check in.</p>
                            <Link href={`/events/${id}`} className="mt-10 block w-full py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs shadow-lg transition-all transform hover:-translate-y-0.5">Register Now</Link>
                        </div>
                    )}

                    {status === 'unauthorized' && (
                        <div className="py-8">
                            <div className="w-24 h-24 bg-blue-50 text-featured-blue rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">👤</div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Sign In Required</h1>
                            <p className="text-slate-500 mt-4 font-medium leading-relaxed">Please sign in with your Zewail City account to automatically check in.</p>
                            <Link href="/join" className="mt-10 block w-full py-4 bg-featured-blue text-white rounded-full font-black uppercase tracking-widest text-xs shadow-lg transition-all transform hover:-translate-y-0.5">Sign In</Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-8">
                            <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">✕</div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Check-in Failed</h1>
                            <p className="text-slate-500 mt-4 font-medium leading-relaxed">Something went wrong. Please ask an organizer to check you in manually.</p>
                            <button onClick={() => window.location.reload()} className="mt-10 w-full py-4 border-2 border-slate-100 text-slate-600 rounded-full font-black uppercase tracking-widest text-xs transition-all hover:bg-slate-50">Retry</button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
