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
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 group">
      <Link href={`/announcements/${announcement.id}`}>
        <div className="relative w-full cursor-pointer overflow-hidden" style={{ paddingTop: '56.25%' }}>
          <Image
            src={announcement.imageUrl || "/announcements-placeholder-image.jpeg"}
            alt={headline}
            layout="fill"
            objectFit="cover"
            loader={announcement.imageUrl?.includes('cloudinary.com') ? undefined : imageLoader}
            className="group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      </Link>
      <div className="p-8 flex-grow flex flex-col">
        <h3 className="text-xl font-black text-featured-blue uppercase tracking-tight mb-2 leading-tight">{headline}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          {announcement.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow font-medium">
          {previewText}
        </p>
        <Link href={`/announcements/${announcement.id}`} className="text-featured-green font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:gap-3 transition-all">
          READ MORE <span className="text-lg">→</span>
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
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
                <span className="inline-block px-3 py-1 rounded-full bg-featured-blue/10 text-featured-blue border border-featured-blue/20 text-[10px] font-black mb-4 uppercase tracking-widest">
                    The Bulletin
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">
                    Latest <span className="text-featured-blue">News</span>
                </h2>
            </div>
        </div>
        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.map(ann => (
              <FeatureCard key={ann.id} announcement={ann} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Announcements will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedAnnouncements;
