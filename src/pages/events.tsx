import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import imageLoader from '../lib/imageLoader';

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location?: string;
  category?: string;
  imageUrl?: string;
  isArchived?: boolean;
  isDraft?: boolean;
}

/**
 * Events — human-crafted:
 *   • Magazine layout: first event in a big block, the rest in a denser
 *     4-col grid so the page reads as a calendar anthology, not a uniform
 *     catalog.
 *   • Off-black ink; warm chip-recruiting for "happening soon".
 *   • Conversational intro copy and CTAs.
 */

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const formatTime = (iso: string) =>
  iso.includes('T')
    ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    : null;

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('date', 'asc'));
        const snap = await getDocs(q);
        const items = snap.docs
          .map(d => ({ id: d.id, ...(d.data() as Omit<EventItem, 'id'>) } as EventItem))
          .filter(e => !e.isArchived && !e.isDraft);
        setEvents(items);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const [headline, ...rest] = events;

  return (
    <div className="min-h-screen paper-surface text-ink">
      <Navbar />

      {/* Hero — a quieter, content-led band */}
      <section className="relative bg-deep text-white topo-wash overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-8">
              <span className="eyebrow text-spark">The calendar</span>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">
                Upcoming<br /><span className="text-spark">gatherings.</span>
              </h1>
            </div>
            <div className="md:col-span-4 text-white/85 text-[15.5px] leading-relaxed">
              <p>
                Workshops, talks, launch parties, and the occasional pizza
                night. Drop in even if you&apos;re new. Most events are
                beginner-friendly on purpose.
              </p>
              <Link
                href="/events/archive"
                className="mt-5 inline-block marker-line text-spark font-medium"
              >
                Past events & archive
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-14 md:py-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="inline-block w-10 h-10 border-2 border-line border-t-deep animate-orbit" />
          </div>
        ) : events.length === 0 ? (
          <section className="text-center py-20 md:py-28 card border-dashed">
            <h2 className="font-display text-[1.5rem] font-semibold text-ink">
              More missions brewing.
            </h2>
            <p className="lead mt-3 mx-auto max-w-md">
              We&apos;re lining up the next round of workshops and launches.
              Want to be told first?
            </p>
            <div className="mt-7">
              <Link href="/join" className="btn btn-primary">
                Join our mailing list
              </Link>
            </div>
          </section>
        ) : (
          <>
            {/* Big headline event (asymmetric anchor) */}
            {headline && <HeadlineEvent event={headline} />}

            {/* Dense list */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7 mt-8 md:mt-12">
                {rest.map(event => <CompactEvent key={event.id} event={event} />)}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ---------------- Subcomponents ---------------- */

function HeadlineEvent({ event }: { event: EventItem }) {
  const time = formatTime(event.date);
  return (
    <article className="card overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
      <Link
        href={`/events/${event.id}`}
        className="md:col-span-7 block relative bg-canvas-surface"
        style={{ minHeight: '320px' }}
      >
        <div className="relative aspect-[16/10] md:aspect-auto md:h-full w-full">
          <Image
            src={event.imageUrl || '/announcements-placeholder-image.jpeg'}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            style={{ objectFit: 'cover' }}
            loader={imageLoader}
            className="photo-natural"
          />
        </div>
      </Link>
      <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-recruiting">{event.category || 'Gathering'}</span>
          <span className="eyebrow text-ink-muted">Next up</span>
        </div>
        <h3 className="mt-4 font-display text-[clamp(1.7rem,3vw,2.4rem)] font-semibold leading-tight text-ink">
          {event.title}
        </h3>
        <p className="mt-4 text-[15.5px] text-ink-soft leading-relaxed">
          {event.description}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-y-4 text-[14px]">
          <div>
            <dt className="eyebrow text-ink-muted">When</dt>
            <dd className="mt-1 text-ink">{formatDate(event.date)}{time && ` · ${time}`}</dd>
          </div>
          {event.location && (
            <div>
              <dt className="eyebrow text-ink-muted">Where</dt>
              <dd className="mt-1 text-ink">{event.location}</dd>
            </div>
          )}
        </dl>

        <div className="mt-8">
          <Link
            href={`/events/${event.id}`}
            className="btn btn-primary"
          >
            Reserve a spot
          </Link>
        </div>
      </div>
    </article>
  );
}

function CompactEvent({ event }: { event: EventItem }) {
  const time = formatTime(event.date);
  return (
    <article className="card overflow-hidden grid grid-cols-1 sm:grid-cols-5 gap-0">
      <Link
        href={`/events/${event.id}`}
        className="sm:col-span-2 block relative bg-canvas-surface"
        style={{ minHeight: '180px' }}
      >
        <div className="relative aspect-[4/3] sm:aspect-auto sm:h-full w-full">
          <Image
            src={event.imageUrl || '/announcements-placeholder-image.jpeg'}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            style={{ objectFit: 'cover' }}
            loader={imageLoader}
            className="photo-natural"
          />
          <span className="absolute top-4 left-4 chip chip-recruiting">
            {event.category || 'Gathering'}
          </span>
        </div>
      </Link>
      <div className="sm:col-span-3 p-6 flex flex-col">
        <p className="eyebrow text-ink-muted">
          {formatDate(event.date)}{time && ` · ${time}`}
        </p>
        <h4 className="mt-1 font-display font-semibold text-[1.15rem] leading-tight text-ink">
          {event.title}
        </h4>
        <p className="mt-2 text-[14px] text-ink-soft leading-relaxed line-clamp-3">
          {event.description}
        </p>
        <Link
          href={`/events/${event.id}`}
          className="mt-4 marker-line text-[13px] font-display font-semibold text-ink self-start"
        >
          Read details
        </Link>
      </div>
    </article>
  );
}
