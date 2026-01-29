import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Image from 'next/image';
import imageLoader from '../../lib/imageLoader';
import Link from 'next/link';

interface Announcement {
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: any;
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
        try {
            const docRef = doc(db, 'announcements', id as string);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              setAnnouncement(docSnap.data() as Announcement);
            }
        } catch (e) {
            console.error("Error fetching announcement:", e);
        } finally {
            setLoading(false);
        }
      };

      fetchAnnouncement();
    }
  }, [id]);

  const formatDate = (dateInput: any) => {
    if (!dateInput) return '';
    const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-featured-blue rounded-full animate-spin"></div>
        </div>
    );
  }

  if (!announcement) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            <main className="pt-72 flex flex-col items-center justify-center px-6">
                <h1 className="text-3xl font-bold mb-4">Announcement Not Found</h1>
                <Link href="/" legacyBehavior>
                    <a className="text-featured-blue font-bold hover:underline">Return Home</a>
                </Link>
            </main>
            <Footer />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      
      {/* Hero Header */}
      <section className="pt-32 md:pt-72 pb-16 md:pb-20 bg-featured-blue text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <Link href="/" legacyBehavior>
                <a className="inline-flex items-center gap-2 text-white/60 font-black text-[10px] mb-6 md:mb-8 hover:text-white transition-all uppercase tracking-[0.2em]">
                    ← BACK TO HOME
                </a>
            </Link>
            <h1 className="text-3xl md:text-6xl font-black mb-6 md:mb-8 leading-tight uppercase tracking-tighter">
                {announcement.title}
            </h1>
            <div className="flex items-center justify-center gap-4 md:gap-6 text-white/60 text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-2">📢 ANNOUNCEMENT</span>
                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                <span>{formatDate(announcement.createdAt)}</span>
            </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <article>
            {announcement.imageUrl && (
              <div className="relative w-full h-[400px] md:h-[600px] mb-16 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white group">
                <Image
                  src={announcement.imageUrl}
                  alt={announcement.title}
                  layout="fill"
                  objectFit="cover"
                  loader={announcement.imageUrl?.includes('cloudinary.com') ? undefined : imageLoader}
                  className="group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}
            
            <div className="bg-white p-8 md:p-16 rounded-[40px] shadow-sm border border-slate-100">
                <div className="prose max-w-none prose-slate prose-headings:text-featured-blue prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900">
                    {announcement.content.split('\n').map((paragraph, idx) => (
                        paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                    ))}
                </div>
                
                <div className="mt-16 pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-slate-300 shadow-inner">ZC</div>
                        <div>
                            <p className="font-black text-slate-800 leading-tight uppercase tracking-tight">AIAA Zewail City</p>
                            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Communication Team</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={() => {
                                navigator.share ? navigator.share({
                                    title: announcement.title,
                                    url: window.location.href
                                }) : alert('Copy link: ' + window.location.href)
                            }}
                            className="px-8 py-3 bg-featured-blue text-white font-black uppercase tracking-widest text-[10px] rounded-full hover:bg-featured-green transition-all shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}