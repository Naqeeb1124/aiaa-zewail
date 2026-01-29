import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Image from 'next/image';

interface ArchivedEvent {
    id: string;
    title: string;
    date: string;
    type: string;
    description: string;
    imageUrl?: string;
    location?: string;
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
        const fetchEvents = async () => {
            try {
                const q = query(collection(db, 'events'), orderBy('date', 'desc'));
                const querySnapshot = await getDocs(q);
                const fetchedEvents = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title,
                        description: data.description,
                        date: data.date,
                        location: data.location,
                        imageUrl: data.imageUrl,
                        type: data.type || 'event',
                        resources: data.resources || []
                    } as ArchivedEvent;
                });
                setEvents(fetchedEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event =>
        filter === 'all' || (event.type && event.type.toLowerCase() === filter)
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <Navbar />
            <main className="pt-72 pb-20 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 animate-fade-in-up bg-featured-blue text-white p-16 rounded-[40px] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter relative z-10">
                        Event <span className="text-featured-green italic text-white/90">Archive</span>
                    </h1>
                    <p className="text-white/70 text-xl max-w-2xl mx-auto font-medium relative z-10">
                        Explore past events, watch recordings, and download technical resources.
                    </p>
                </div>

                {/* Filter */}
                <div className="flex justify-center gap-4 mb-16 flex-wrap">
                    {['all', 'workshop', 'seminar', 'competition', 'event'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${filter === type
                                ? 'bg-zewail-cyan text-slate-900 shadow-xl shadow-zewail-cyan/20 transform -translate-y-0.5'
                                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-12 h-12 border-4 border-slate-700 border-t-zewail-cyan rounded-full animate-spin"></div>
                        <p className="mt-6 text-slate-500 font-black uppercase tracking-widest text-[10px]">Accessing Database...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center py-24 bg-slate-800/30 rounded-[40px] border border-slate-800 shadow-inner">
                        <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">No events found in this sector.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {filteredEvents.map((event, index) => (
                            <div
                                key={event.id}
                                className="bg-slate-800/40 backdrop-blur-md border border-slate-800 rounded-[40px] overflow-hidden flex flex-col md:flex-row hover:border-slate-600 transition-all duration-500 group hover:shadow-2xl hover:shadow-zewail-cyan/5 animate-fade-in-up hover:-translate-y-1"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Image */}
                                <div className="md:w-1/3 bg-slate-800 h-64 md:h-auto relative overflow-hidden">
                                    {event.imageUrl ? (
                                        <Image
                                            src={event.imageUrl}
                                            alt={event.title}
                                            layout="fill"
                                            objectFit="cover"
                                            className="transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-black text-xl bg-slate-900">
                                            {event.type.toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 md:opacity-0 md:group-hover:opacity-30 transition-opacity"></div>
                                </div>
                                <div className="p-10 md:p-16 md:w-2/3 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <p className="text-zewail-cyan text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                                <h3 className="text-3xl font-black text-white mb-4 group-hover:text-zewail-cyan transition-colors uppercase tracking-tight">{event.title}</h3>
                                                {event.location && (
                                                    <p className="text-slate-500 text-xs font-bold flex items-center gap-3 mb-6 uppercase tracking-widest">
                                                        <svg className="w-4 h-4 text-zewail-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                        {event.location}
                                                    </p>                                                )}
                                            </div>
                                            <span className="px-4 py-1.5 rounded-full bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-700 group-hover:border-zewail-cyan group-hover:text-zewail-cyan transition-all shadow-lg">
                                                {event.type}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 mb-10 leading-relaxed font-medium text-lg">{event.description}</p>
                                    </div>
                                    {event.resources && event.resources.length > 0 && (
                                        <div className="flex flex-wrap gap-4 pt-10 border-t border-slate-700/50">
                                            {event.resources.map((res, i) => (
                                                <a
                                                    key={i}
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:border-zewail-cyan hover:text-white transition-all hover:shadow-xl hover:shadow-zewail-cyan/10 transform hover:-translate-y-0.5"
                                                >
                                                    <span className="text-lg">
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
