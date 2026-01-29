import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Image from 'next/image';
import imageLoader from '../lib/imageLoader';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  imageUrl?: string;
}

const EventCard = ({ event }: { event: Event }) => {
  const previewText = event.description.length > 100 ? `${event.description.substring(0, 100)}...` : event.description;
  const eventDate = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const eventTime = event.date.includes('T') 
    ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    : null;

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 group">
      <Link href={`/events/${event.id}`}>
        <div className="relative w-full cursor-pointer overflow-hidden" style={{ paddingTop: '56.25%' }}>
          <Image
            src={event.imageUrl || "/announcements-placeholder-image.jpeg"}
            alt={event.title}
            layout="fill"
            objectFit="cover"
            loader={imageLoader}
            className="group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      </Link>
      <div className="p-8 flex-grow flex flex-col">
        <h3 className="text-xl font-black text-featured-blue uppercase tracking-tight mb-2 leading-tight">{event.title}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          {eventDate} {eventTime && `• ${eventTime}`}
        </p>
        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow font-medium">
          {previewText}
        </p>
        <Link href={`/events/${event.id}`} className="text-featured-green font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:gap-3 transition-all">
          VIEW DETAILS <span className="text-lg">→</span>
        </Link>
      </div>
    </div>
  );
};

const FeaturedEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const q = query(collection(db, 'events'), orderBy('date', 'desc'), limit(3));
      const querySnapshot = await getDocs(q);
      const fetchedEvents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
      setEvents(fetchedEvents);
    };

    fetchEvents();
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
                <span className="inline-block px-3 py-1 rounded-full bg-featured-green/10 text-featured-green border border-featured-green/20 text-[10px] font-black mb-4 uppercase tracking-widest">
                    The Calendar
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">
                    Upcoming <span className="text-featured-green">Gatherings</span>
                </h2>
            </div>
            <Link href="/events" legacyBehavior>
                <a className="px-8 py-3 rounded-full border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:border-featured-blue hover:text-featured-blue transition-all">
                    View Archive
                </a>
            </Link>
        </div>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No upcoming events. Please check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;
