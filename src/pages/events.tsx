import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Image from 'next/image'
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import imageLoader from '../lib/imageLoader';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  category?: string;
  imageUrl?: string;
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('date', 'asc'));
        const querySnapshot = await getDocs(q);
        const fetchedEvents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Event));
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-72 pb-16 md:pb-32 bg-featured-blue text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-black mb-6 uppercase tracking-widest">
            The Calendar
          </span>
          <h1 className="text-4xl md:text-7xl font-black mb-8 uppercase tracking-tighter">
            Upcoming <span className="text-white/70 italic">Events</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium max-w-2xl mx-auto">
            Discover our first season of workshops, talks, and gatherings designed to ignite your passion for aerospace.
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-32">
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-featured-blue"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {events.map((event) => (
              <Link href={`/events/${event.id}`} key={event.id} legacyBehavior>
                <a className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-featured-green/30 transition-all duration-500 flex flex-col md:flex-row group cursor-pointer hover:-translate-y-2">
                  <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
                    <Image 
                      src={event.imageUrl || "/announcements-placeholder-image.jpeg"} 
                      alt={event.title}
                      layout="fill"
                      objectFit="cover"
                      loader={imageLoader}
                      className="group-hover:scale-110 transition-transform duration-700"
                    />
                    {event.category && (
                      <div className="absolute top-6 left-6 bg-featured-blue/90 backdrop-blur-sm text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">
                        {event.category}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-10 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-featured-green font-black text-[10px] mb-4 uppercase tracking-[0.2em]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-featured-blue transition-colors uppercase tracking-tight leading-tight">{event.title}</h3>
                      <p className="text-slate-500 leading-relaxed mb-8 line-clamp-3 font-medium text-sm">{event.description}</p>
                    </div>
                    
                    <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row gap-6 sm:items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-featured-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {event.date.includes('T') 
                          ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                          : (event.time || 'TBD')}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-featured-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State / Coming Soon */}
        {!loading && events.length === 0 && (
          <div className="mt-24 text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner">
            <p className="text-xl text-slate-400 font-black uppercase tracking-widest">More missions are being planned.</p>
            <Link href="/join" legacyBehavior>
              <a className="inline-block mt-10 px-10 py-4 rounded-full bg-featured-blue text-white font-black uppercase tracking-widest text-sm hover:bg-featured-green transition-all shadow-xl transform hover:-translate-y-1">
                Join our Mailing List
              </a>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
