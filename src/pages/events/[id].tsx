import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';

export default function EventDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [registration, setRegistration] = useState<any>(null);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!id) return;

        const fetchEventAndRegistration = async () => {
            try {
                // Fetch event
                const eventDoc = await getDoc(doc(db, 'events', id as string));
                if (eventDoc.exists()) {
                    setEvent({ id: eventDoc.id, ...eventDoc.data() });
                }

                // Fetch registration if user is logged in
                if (user) {
                    const q = query(
                        collection(db, 'registrations'),
                        where('eventId', '==', id),
                        where('userId', '==', user.uid)
                    );
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        setRegistration({ id: snap.docs[0].id, ...snap.docs[0].data() });
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEventAndRegistration();
    }, [id, user]);

    const handleRegister = async () => {
        if (!user) {
            router.push('/join');
            return;
        }
        setRegistering(true);
        try {
            const regData = {
                eventId: id,
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || 'Anonymous',
                status: 'registered',
                registeredAt: new Date().toISOString()
            };
            const docRef = await addDoc(collection(db, 'registrations'), regData);
            setRegistration({ id: docRef.id, ...regData });
            alert('Successfully registered!');
        } catch (error) {
            console.error("Error registering:", error);
            alert("Registration failed. Please try again.");
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-zewail-cyan rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center flex-col">
                <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
                <Link href="/events" legacyBehavior>
                    <a className="text-featured-blue hover:underline font-bold">Back to Events</a>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />

            {/* Header / Hero Section */}
            <section className="pt-32 md:pt-72 pb-12 md:pb-20 bg-featured-blue text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="flex-1">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-black mb-6 uppercase tracking-widest">
                                Upcoming Event
                            </span>
                            <h1 className="text-3xl md:text-6xl font-black mb-6 uppercase tracking-tighter leading-tight">{event.title}</h1>
                            <div className="flex flex-wrap gap-6 md:gap-8 text-white/70 text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg md:text-xl">📅</span>
                                    {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg md:text-xl">⏰</span>
                                    {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg md:text-xl">📍</span>
                                    {event.location}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 py-12 md:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                <div className="lg:col-span-2 space-y-8">
                    {/* Event Banner */}
                    <div className="relative h-[400px] w-full rounded-[40px] overflow-hidden shadow-sm border border-slate-200">
                        {event.imageUrl ? (
                            <Image
                                src={event.imageUrl}
                                alt={event.title}
                                layout="fill"
                                objectFit="cover"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-featured-blue to-slate-800 flex items-center justify-center">
                                <span className="text-white/20 text-6xl font-bold">AIAA</span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="bg-white p-8 md:p-16 rounded-[40px] shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
                        <h2 className="text-2xl font-black mb-8 text-slate-800 border-b border-slate-50 pb-6 uppercase tracking-tight">About This Event</h2>
                        <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg font-medium">
                            {event.description}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 sticky top-32 group hover:shadow-xl transition-all duration-500">
                        <h3 className="text-xl font-black mb-8 text-slate-800 uppercase tracking-tight">Registration</h3>

                        {registration ? (
                            <div className="text-center p-8 bg-green-50 rounded-[32px] border border-green-100">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner">
                                    ✓
                                </div>
                                <h4 className="text-lg font-black text-green-900 mb-2 uppercase tracking-tight">Access Confirmed</h4>
                                <p className="text-green-700 text-sm mb-10 font-medium">Your mission slot is reserved. <br/> Check your portal for more intel.</p>
                                <Link href="/dashboard?tab=registrations" legacyBehavior>
                                    <a className="block w-full py-4 rounded-full bg-featured-blue text-white font-black uppercase tracking-widest text-[10px] hover:bg-featured-green transition-all text-center shadow-lg transform hover:-translate-y-0.5">
                                        Open Dashboard
                                    </a>
                                </Link>
                            </div>
                        ) : (
                            <div>
                                <p className="text-slate-500 mb-10 font-medium leading-relaxed">Secure your spot for this session. Participation certificates will be issued to all attendees.</p>
                                <button
                                    onClick={handleRegister}
                                    disabled={registering}
                                    className="w-full py-4 rounded-full bg-featured-blue text-white font-black uppercase tracking-widest text-xs hover:bg-featured-green transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:-translate-y-0.5"
                                >
                                    {registering ? 'Processing...' : 'Register for Event'}
                                </button>
                                {!user && (
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center mt-6 text-slate-400">
                                        Already a member? <Link href="/join" legacyBehavior><a className="text-featured-blue hover:text-featured-green transition-colors">Sign in</a></Link>
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="mt-10 pt-10 border-t border-slate-50">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Event Host</h4>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-slate-300 shadow-inner">
                                    ZC
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">AIAA Zewail City</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Student Branch</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}