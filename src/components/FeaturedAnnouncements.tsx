import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

interface Announcement {
  id: string;
  title?: string;
  content?: string;
  text?: string; // For backward compatibility
  imageUrl?: string;
  createdAt: {
    toDate: () => Date;
  };
}

const FeatureCard = ({ announcement }: { announcement: Announcement }) => {
  const headline = announcement.title || announcement.text || 'Untitled Announcement';
  const body = announcement.content || announcement.text || '';
  const previewText = body.length > 100 ? `${body.substring(0, 100)}...` : body;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <Link href={`/announcements/${announcement.id}`}>
        <div className="relative w-full cursor-pointer" style={{ paddingTop: '56.25%' }}>
          <Image
            src={announcement.imageUrl || "/announcements-placeholder-image.jpeg"}
            alt={headline}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </Link>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-xl font-bold text-featured-blue">{headline}</h3>
        <p className="text-sm text-gray-500 mt-2">
          {announcement.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="text-gray-600 mt-4 flex-grow">
          {previewText}
        </p>
        <Link href={`/announcements/${announcement.id}`} className="text-featured-green font-semibold mt-4 self-start hover:text-hover-blue transition-colors">
          READ MORE →
        </Link>
      </div>
    </div>
  );
};

const FeaturedAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(3));
      const querySnapshot = await getDocs(q);
      const fetchedAnnouncements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Announcement));
      setAnnouncements(fetchedAnnouncements);
    };

    fetchAnnouncements();
  }, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">
          Featured
        </h2>
        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.map(ann => (
              <FeatureCard key={ann.id} announcement={ann} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Announcements will appear here.</p>
        )}
      </div>
    </section>
  );
};

export default FeaturedAnnouncements;
