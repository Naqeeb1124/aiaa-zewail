import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Image from 'next/image';
import imageLoader from '../lib/imageLoader';
import Link from 'next/link';

interface Announcement {
  id: string;
  title?: string;
  content?: string;
  text?: string;
  imageUrl?: string;
  isDraft?: boolean;
  createdAt: { toDate: () => Date };
}

/**
 * FeaturedAnnouncements — human-crafted:
 *   • Eyebrow in signal-orange for warmth (NOT more navy everywhere).
 *   • Date stamp + scanline treatment gives a "bulletin board" feel
 *     rather than a list of feature-blue cards.
 *   • Off-black body copy.
 */

const FeatureCard = ({ announcement }: { announcement: Announcement }) => {
  const headline = announcement.title || announcement.text || 'Untitled';
  const body = announcement.content || announcement.text || '';
  const preview = body.length > 110 ? `${body.substring(0, 110)}[..]` : body;

  return (
    <article className="card overflow-hidden flex flex-col">
      <Link href={`/announcements/${announcement.id}`} className="group block relative w-full" style={{ paddingTop: '58%' }}>
        <Image
          src={announcement.imageUrl || '/announcements-placeholder-image.jpeg'}
          alt={headline}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: 'cover' }}
          loader={announcement.imageUrl?.includes('cloudinary.com') ? undefined : imageLoader}
          className="photo-natural duration-slow ease-human group-hover:scale-[1.03]"
        />
        <span className="absolute top-4 left-4 chip chip-flagship z-10">
          Bulletin
        </span>
      </Link>
      <div className="p-7 flex-grow flex flex-col">
        <p className="eyebrow text-ink-muted">
          {announcement.createdAt.toDate().toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
          })}
        </p>
        <h3 className="mt-2 font-display font-semibold text-[1.25rem] leading-snug text-ink">
          {headline}
        </h3>
        <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed flex-grow">
          {preview}
        </p>
        <Link
          href={`/announcements/${announcement.id}`}
          className="mt-6 marker-line text-[13px] font-display font-semibold text-ink self-start"
        >
          Read it
        </Link>
      </div>
    </article>
  );
};

const FeaturedAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(10));
        const snap = await getDocs(q);
        const items = snap.docs
          .map(doc => ({ id: doc.id, ...(doc.data() as Omit<Announcement, 'id'>) } as Announcement))
          .filter(a => !a.isDraft)
          .slice(0, 3);
        setAnnouncements(items);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading || announcements.length === 0) return null;

  return (
    <section className="paper-surface py-20 md:py-28 border-y border-line">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-6">
          <div className="max-w-xl">
            <span className="eyebrow ember">The bulletin board</span>
            <h2 className="mt-2 font-display text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight text-ink">
              What we&apos;ve been up to.
            </h2>
            <p className="lead mt-3">
              Recaps, calls, and the occasional late-night workshop photo
              from your fellow branch members.
            </p>
          </div>
          <Link
            href="/announcements"
            className="btn btn-secondary self-start md:self-auto"
          >
            See all announcements
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {announcements.map(ann => (
            <FeatureCard key={ann.id} announcement={ann} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedAnnouncements;
