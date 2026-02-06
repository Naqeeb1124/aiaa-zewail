import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import ImageUpload from '../../components/ImageUpload';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', imageUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setAnnouncements(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAnnouncement(prevState => ({ ...prevState, [name]: value }));
  };

  const handleImageUploadSuccess = (url: string) => {
    setNewAnnouncement(prevState => ({ ...prevState, imageUrl: url }));
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newAnnouncement.title;
    const content = newAnnouncement.content;
    const imageUrl = newAnnouncement.imageUrl;

    if (!title || !content) return;

    setIsSubmitting(true);
    try {
        // 1. Post to Firestore
        const docRef = await addDoc(collection(db, 'announcements'), {
          title,
          content,
          imageUrl,
          createdAt: new Date(),
        });
        
        // Optimistic update
        const newItem = { id: docRef.id, title, content, imageUrl, createdAt: { toDate: () => new Date() } };
        setAnnouncements([newItem, ...announcements]);
        setNewAnnouncement({ title: '', content: '', imageUrl: '' });
        
        // 2. Email notification logic - wrapped in its own try-catch
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No authenticated user found for sending notifications.");
            
            const token = await user.getIdToken();
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const recipients = usersSnapshot.docs
                .map(d => ({ 
                    id: d.id, 
                    name: d.data().name,
                    email: d.data().email,
                    subscribedToAnnouncements: d.data().subscribedToAnnouncements,
                    firstName: d.data().name?.split(' ')[0] || ''
                }))
                .filter((u: any) => u.subscribedToAnnouncements !== false && u.email)
                .map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    firstName: u.firstName
                }));

            if (recipients.length > 0) {
                const SITE_URL = window.location.origin;
                const contentHtml = `
                    <p style="font-size: 16px; color: #334155;">Hi {{name}},</p>
                    <h1 style="color: #2b4b77; font-size: 24px; margin-bottom: 20px;">New Announcement</h1>
                    <p style="font-size: 18px; font-weight: bold; color: #334155; margin-bottom: 15px;">${title}</p>
                    <div style="color: #475569; line-height: 1.6;">
                        ${content.replace(/\n/g, '<br/>')}
                    </div>
                    <div style="margin-top: 30px;">
                        <a href="${SITE_URL}/announcements/${docRef.id}" style="display: inline-block; padding: 12px 24px; background-color: #78af03; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Read Full Update</a>
                    </div>
                `;

                const res = await fetch('/api/admin/bulk-email', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        recipients,
                        subject: `AIAA Announcement: ${title}`,
                        htmlTemplate: contentHtml,
                        useBranding: true,
                        siteUrl: SITE_URL
                    }),
                });
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Failed to send emails via API.");
                }
                
                const resultData = await res.json();
                alert(`Announcement published! Notification sent to ${resultData.success} members.`);
            } else {
                alert('Announcement published! (No subscribers to notify)');
            }
        } catch (emailError: any) {
            console.error("Error during email notification phase:", emailError);
            alert('Announcement published successfully, but email notifications failed: ' + emailError.message);
        }

    } catch (error) {
        console.error("Error adding announcement:", error);
        alert('Failed to publish announcement.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if(!confirm('Delete this announcement?')) return;
    try {
        await deleteDoc(doc(db, 'announcements', id));
        setAnnouncements(announcements.filter(ann => ann.id !== id));
    } catch (error) {
        alert('Error deleting announcement.');
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        
        <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl font-extrabold mb-2">Newsroom</h1>
            <p className="text-slate-400">Manage announcements and notify members.</p>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-32">
                        <h2 className="text-xl font-bold mb-6 text-slate-800">Compose Announcement</h2>
                        <form onSubmit={handleAddAnnouncement} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Headline</label>
                                <input required type="text" name="title" value={newAnnouncement.title} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="Important Update..." />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cover Image</label>
                                <ImageUpload onUploadSuccess={handleImageUploadSuccess} initialImageUrl={newAnnouncement.imageUrl} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Content</label>
                                <textarea required name="content" value={newAnnouncement.content} onChange={handleInputChange} rows={8} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="Write your message here..." />
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-featured-blue text-white font-bold rounded-xl hover:bg-featured-green transition-colors disabled:opacity-50">
                                {isSubmitting ? 'Posting...' : 'Post Announcement'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-6 text-slate-800">Published News ({announcements.length})</h2>
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading news...</div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                            <p className="text-slate-400">No announcements posted yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {announcements.map((ann) => (
                                <div key={ann.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
                                    {ann.imageUrl && (
                                        <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden mb-4">
                                            <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-slate-800">{ann.title}</h3>
                                        <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-red-400 hover:text-red-600 p-1">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                    <p className="text-slate-600 text-sm whitespace-pre-wrap">{ann.content}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-bold text-slate-400 uppercase">
                                        Posted: {ann.createdAt?.toDate ? ann.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
        <Footer />
      </div>
    </AdminGuard>
  );
}
