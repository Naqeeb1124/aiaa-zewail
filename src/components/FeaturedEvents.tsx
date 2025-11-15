import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Image from 'next/image';
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

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <Link href="#">
        <div className="relative w-full cursor-pointer" style={{ paddingTop: '56.25%' }}>
          <Image
            src={event.imageUrl || "/announcements-placeholder-image.jpeg"}
            alt={event.title}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </Link>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-featured-blue">{event.title}</h3>
        <p className="text-sm text-gray-500 mt-2">
          {eventDate}
        </p>
        <p className="text-gray-600 mt-4 flex-grow">
          {previewText}
        </p>
        <Link href="#" className="text-featured-green font-semibold mt-4 self-start hover:text-hover-blue transition-colors">
          VIEW DETAILS →
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
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">
          Featured Events
        </h2>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No upcoming events. Please check back soon!</p>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;
