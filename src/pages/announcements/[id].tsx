import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Image from 'next/image';
import imageLoader from '../../lib/imageLoader';

interface Announcement {
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: {
    toDate: () => Date;
  };
}

export default function AnnouncementPage() {
  const router = useRouter();
  const { id } = router.query;
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchAnnouncement = async () => {
        setLoading(true);
        const docRef = doc(db, 'announcements', id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setAnnouncement(docSnap.data() as Announcement);
        } else {
          console.log('No such document!');
        }
        setLoading(false);
      };

      fetchAnnouncement();
    }
  }, [id]);

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-4xl mx-auto p-6">
        {loading ? (
          <p>Loading...</p>
        ) : announcement ? (
          <article>
            <h1 className="text-4xl font-bold text-featured-blue mb-4">{announcement.title}</h1>
            <p className="text-gray-500 mb-8">
              {announcement.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            {announcement.imageUrl && (
              <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={announcement.imageUrl}
                  alt={announcement.title}
                  layout="fill"
                  objectFit="cover"
                  loader={imageLoader}
                />
              </div>
            )}
            <div className="prose max-w-none">
              <p>{announcement.content}</p>
            </div>
          </article>
        ) : (
          <p>Announcement not found.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
