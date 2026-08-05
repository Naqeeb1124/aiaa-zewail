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
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'unauthenticated'>('loading');
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
                const eventData = eventDoc.data();
                if (eventData.isArchived || eventData.isDraft) {
                    setStatus('error');
                    return;
                }
                setEventName(eventData.title);

                // 2. Find the registration for this user and event
                const q = query(
                    collection(db, 'registrations'),
                    where('eventId', '==', id),
                    where('userId', '==', user.uid)
                );
                
                const snap = await getDocs(q);
                
                if (snap.empty) {
                    setStatus('error');
                    return;
                }

                // 3. Update existing status to attended
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
        <div className="min-h-screen bg-canvas flex flex-col">
            <Seo title="Event Check-in - AIAA Zewail City" />
            <Navbar />
            
            <main className="flex-grow flex items-start justify-center px-6 pt-72 pb-20">
                <div className="max-w-md w-full bg-white border border-line p-10 text-center">
                    {status === 'loading' && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 border-4 border-line border-t-deep animate-spin mx-auto"></div>
                            <h2 className="text-xl font-black text-deep uppercase tracking-tight">Verifying Mission Credentials...</h2>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-signal-soft text-growth flex items-center justify-center mx-auto mb-8 text-4xl">
                                ✓
                            </div>
                            <h2 className="text-3xl font-black text-ink mb-4 uppercase tracking-tighter leading-none">Mission Start!</h2>
                            <p className="text-ink-soft font-medium mb-8">Welcome to <span className="text-deep font-bold">{eventName}</span>. Your attendance has been logged.</p>
                            <Link href="/dashboard" legacyBehavior>
                                <a className="inline-block w-full py-4 bg-deep text-white font-black uppercase tracking-widest text-xs hover:bg-growth transition-all transform hover:-translate-y-0.5">
                                    Go to Member Portal
                                </a>
                            </Link>
                        </div>
                    )}

                    {status === 'unauthenticated' && (
                        <div>
                            <div className="w-24 h-24 bg-canvas text-deep flex items-center justify-center mx-auto mb-8 text-4xl">
                                👤
                            </div>
                            <h2 className="text-2xl font-black text-ink mb-4 uppercase tracking-tighter">Identity Required</h2>
                            <p className="text-ink-soft font-medium mb-8">Please sign in with your Zewail City account to complete your check-in.</p>
                            <Link href={`/join?redirect=${encodeURIComponent(router.asPath)}`} legacyBehavior>
                                <a className="inline-block w-full py-4 bg-deep text-white font-black uppercase tracking-widest text-xs hover:bg-growth transition-all">
                                    Sign In
                                </a>
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div>
                            <div className="w-24 h-24 bg-accent-orange-soft text-ember flex items-center justify-center mx-auto mb-8 text-4xl">
                                [X]
                            </div>
                            <h2 className="text-2xl font-black text-ink mb-4 uppercase tracking-tighter">System Error</h2>
                            <p className="text-ink-soft font-medium mb-8">We couldn&apos;t process your check-in. The event ID might be invalid or the system is down.</p>
                            <Link href="/" legacyBehavior>
                                <a className="inline-block w-full py-4 bg-ink text-white font-black uppercase tracking-widest text-xs hover:bg-deep transition-all">
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
