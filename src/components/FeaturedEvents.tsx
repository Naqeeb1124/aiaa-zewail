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
  isArchived?: boolean;
  isDraft?: boolean;
  category?: string;
}

/**
 * FeaturedEvents — human-crafted:
 *   • Asymmetric date stamp + category chip — not centered paragraphs.
 *   • Off-black body copy; warm-yellow category chips.
 *   • Image cards use a natural photo filter, not heavy color grading.
 */

const EventCard = ({ event }: { event: Event }) => {
  const preview = event.description.length > 110 ? `${event.description.substring(0, 110)}[..]` : event.description;
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const eventTime = event.date.includes('T')
    ? new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    : null;

  return (
    <article className="card overflow-hidden flex flex-col">
      <Link href={`/events/${event.id}`} className="group block relative w-full" style={{ paddingTop: '58%' }}>
        <Image
          src={event.imageUrl || '/announcements-placeholder-image.jpeg'}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: 'cover' }}
          loader={imageLoader}
          className="photo-natural duration-slow ease-human group-hover:scale-[1.03]"
        />
        <span className="absolute top-4 left-4 chip chip-recruiting z-10">
          {event.category || 'Gathering'}
        </span>
      </Link>
      <div className="p-7 flex-grow flex flex-col">
        <p className="eyebrow text-ink-muted">
          {eventDate}{eventTime ? ` · ${eventTime}` : ''}
        </p>
        <h3 className="mt-2 font-display font-semibold text-[1.25rem] leading-snug text-ink">
          {event.title}
        </h3>
        <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed flex-grow">
          {preview}
        </p>
        <Link
          href={`/events/${event.id}`}
          className="mt-6 marker-line text-[13px] font-display font-semibold text-ink self-start"
        >
          Save your seat
        </Link>
      </div>
    </article>
  );
};

const FeaturedEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('date', 'desc'), limit(15));
        const snap = await getDocs(q);
        const items = snap.docs
          .map(doc => ({ id: doc.id, ...(doc.data() as Omit<Event, 'id'>) } as Event))
          .filter(e => !e.isArchived && !e.isDraft)
          .slice(0, 3);
        setEvents(items);
      } catch (err) {
        console.error('Error fetching featured events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading || events.length === 0) return null;

  return (
    <section className="paper-surface py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-6">
          <div className="max-w-xl">
            <span className="eyebrow text-deep">Upcoming gatherings</span>
            <h2 className="mt-2 font-display text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight text-ink">
              Where to find us next.
            </h2>
            <p className="lead mt-3">
              Workshops, talks, launch parties. All free, all open to anyone
              curious. Pop in even if it&apos;s your first time.
            </p>
          </div>
          <Link
            href="/events"
            className="btn btn-secondary self-start md:self-auto"
          >
            See the calendar
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
