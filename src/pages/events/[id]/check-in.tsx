import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db, auth } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Seo from '../../../components/Seo';
import Link from 'next/link';

export default function EventCheckIn() {
    const router = useRouter();
    const { id } = router.query;
    const [user, setUser] = useState<any>(null);
    const [status, setStatus] = useState<'loading' | 'success' | 'not_registered' | 'error' | 'unauthenticated'>('loading');
    const [eventName, setEventName] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u);
            } else {
                setStatus('unauthenticated');
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!id || !user) return;

        const performCheckIn = async () => {
            try {
                // 1. Verify Event exists
                const eventDoc = await getDoc(doc(db, 'events', id as string));
                if (!eventDoc.exists()) {
                    setStatus('error');
                    return;
                }
                setEventName(eventDoc.data().title);

                // 2. Find the registration for this user and event
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

                // 3. Update status to attended
                const registrationId = snap.docs[0].id;
                await updateDoc(doc(db, 'registrations', registrationId), {
                    status: 'attended',
                    attendedAt: new Date().toISOString()
                });

                setStatus('success');
            } catch (error) {
                console.error("Check-in error:", error);
                setStatus('error');
            }
        };

        performCheckIn();
    }, [id, user]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Seo title="Event Check-in - AIAA Zewail City" />
            <Navbar />
            
            <main className="flex-grow flex items-center justify-center px-6 py-20">
                <div className="max-w-md w-full bg-white rounded-[40px] shadow-xl border border-slate-100 p-10 text-center">
                    {status === 'loading' && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 border-4 border-slate-100 border-t-featured-blue rounded-full animate-spin mx-auto"></div>
                            <h2 className="text-xl font-black text-featured-blue uppercase tracking-tight">Verifying Mission Credentials...</h2>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">
                                ✓
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">Mission Start!</h2>
                            <p className="text-slate-500 font-medium mb-8">Welcome to <span className="text-featured-blue font-bold">{eventName}</span>. Your attendance has been logged.</p>
                            <Link href="/dashboard" legacyBehavior>
                                <a className="inline-block w-full py-4 bg-featured-blue text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-featured-green transition-all shadow-lg transform hover:-translate-y-0.5">
                                    Go to Member Portal
                                </a>
                            </Link>
                        </div>
                    )}

                    {status === 'not_registered' && (
                        <div>
                            <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                                !
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">No Registration Found</h2>
                            <p className="text-slate-500 font-medium mb-8">It seems you haven't registered for this event yet. Please register first to check in.</p>
                            <Link href={`/events/${id}`} legacyBehavior>
                                <a className="inline-block w-full py-4 bg-featured-blue text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-featured-green transition-all shadow-lg">
                                    Register Now
                                </a>
                            </Link>
                        </div>
                    )}

                    {status === 'unauthenticated' && (
                        <div>
                            <div className="w-24 h-24 bg-blue-50 text-featured-blue rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                                👤
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Identity Required</h2>
                            <p className="text-slate-500 font-medium mb-8">Please sign in with your Zewail City account to complete your check-in.</p>
                            <Link href="/join" legacyBehavior>
                                <a className="inline-block w-full py-4 bg-featured-blue text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-featured-green transition-all shadow-lg">
                                    Sign In
                                </a>
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div>
                            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                                ✕
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">System Error</h2>
                            <p className="text-slate-500 font-medium mb-8">We couldn't process your check-in. The event ID might be invalid or the system is down.</p>
                            <Link href="/" legacyBehavior>
                                <a className="inline-block w-full py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-featured-blue transition-all shadow-lg">
                                    Return Home
                                </a>
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}