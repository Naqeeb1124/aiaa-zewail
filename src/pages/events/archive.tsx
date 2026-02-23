import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import imageLoader from '../../lib/imageLoader';

interface ArchivedEvent {
    id: string;
    title: string;
    date: string;
    category: string;
    description: string;
    imageUrl?: string;
    location?: string;
    isArchived?: boolean;
    resources?: {
        type: 'slides' | 'video' | 'code' | 'photos';
        label: string;
        url: string;
    }[];
}

export default function EventArchive() {
    const [events, setEvents] = useState<ArchivedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const q = query(collection(db, 'events'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEvents = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as ArchivedEvent))
                .filter(event => event.isArchived); // Only show archived events
            
            setEvents(fetchedEvents);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching archived events:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredEvents = events.filter(event =>
        filter === 'all' || (event.category && event.category.toLowerCase() === filter.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-32 md:pt-72 pb-16 md:pb-32 bg-slate-900 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-black mb-6 uppercase tracking-widest">
                        The Chronicle
                    </span>
                    <h1 className="text-4xl md:text-7xl font-black mb-8 uppercase tracking-tighter leading-tight">
                        Event <span className="text-white/70 italic text-white/90">Archive</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto font-medium">
                        Explore past technical workshops, guest lectures, and competitions that shaped our community.
                    </p>
                    
                    <div className="mt-10">
                        <Link href="/events" legacyBehavior>
                            <a className="text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border border-white/20 hover:bg-white hover:text-slate-900 transition-all">
                                Return to Upcoming Events
                            </a>
                        </Link>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 py-16 md:py-32">
                {/* Filter */}
                <div className="flex justify-center gap-2 mb-16 flex-wrap">
                    {['all', 'workshop', 'ceremony', 'webinar', 'social', 'competition'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === type
                                ? 'bg-featured-blue text-white shadow-lg'
                                : 'bg-white text-slate-400 hover:text-featured-blue border border-slate-100'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-featured-blue"></div>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200">
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No historical records match your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-12">
                        {filteredEvents.map((event, index) => (
                            <div
                                key={event.id}
                                className="bg-white border border-slate-100 rounded-[40px] overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-500 group"
                            >
                                {/* Image */}
                                <div className="md:w-1/3 bg-slate-50 h-64 md:h-auto relative overflow-hidden">
                                    <Image
                                        src={event.imageUrl || "/announcements-placeholder-image.jpeg"}
                                        alt={event.title}
                                        layout="fill"
                                        objectFit="cover"
                                        loader={imageLoader}
                                        className="transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    />
                                    <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[8px] font-black text-featured-blue uppercase tracking-widest border border-slate-100">
                                        {event.category}
                                    </div>
                                </div>
                                
                                <div className="p-10 md:p-16 md:w-2/3 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="text-featured-green text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                                <h3 className="text-3xl font-black text-slate-900 group-hover:text-featured-blue transition-colors uppercase tracking-tight">{event.title}</h3>
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-200">
                                                Archived
                                            </span>
                                        </div>
                                        <p className="text-slate-500 mb-8 leading-relaxed font-medium text-base line-clamp-4">{event.description}</p>
                                    </div>
                                    
                                    {event.resources && event.resources.length > 0 && (
                                        <div className="flex flex-wrap gap-3 pt-8 border-t border-slate-50">
                                            {event.resources.map((res, i) => (
                                                <a
                                                    key={i}
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-featured-blue hover:text-featured-blue transition-all"
                                                >
                                                    <span>
                                                        {res.type === 'slides' ? '📑' :
                                                            res.type === 'video' ? '▶️' :
                                                                res.type === 'code' ? '💻' : '📷'}
                                                    </span>
                                                    {res.label}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
