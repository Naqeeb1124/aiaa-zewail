import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, updateDoc, serverTimestamp } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import ImageUpload from '../../components/ImageUpload';
import Link from 'next/link';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', imageUrl: '', isDraft: false });
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
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setNewAnnouncement(prevState => ({ ...prevState, [name]: val }));
  };

  const handleImageUploadSuccess = (url: string) => {
    setNewAnnouncement(prevState => ({ ...prevState, imageUrl: url }));
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const { title, content, imageUrl, isDraft } = newAnnouncement;

    if (!title || !content) return;

    setIsSubmitting(true);
    try {
        // 1. Post to Firestore
        const docRef = await addDoc(collection(db, 'announcements'), {
          title,
          content,
          imageUrl,
          isDraft,
          createdAt: new Date(),
        });
        
        // Optimistic update
        const newItem = { id: docRef.id, title, content, imageUrl, isDraft, createdAt: { toDate: () => new Date() } };
        setAnnouncements([newItem, ...announcements]);
        setNewAnnouncement({ title: '', content: '', imageUrl: '', isDraft: false });
        
        // 2. Email notification logic - only if NOT a draft
        if (!isDraft) {
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
        } else {
            alert('Draft saved! It will not be visible to members until published.');
        }

    } catch (error) {
        console.error("Error adding announcement:", error);
        alert('Failed to process announcement.');
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

  const handleToggleDraft = async (ann: any) => {
    const newDraftState = !ann.isDraft;
    if (!confirm(`${newDraftState ? 'Move to Drafts?' : 'Publish this announcement for everyone to see?'}`)) return;
    try {
        await updateDoc(doc(db, 'announcements', ann.id), {
            isDraft: newDraftState,
            updatedAt: serverTimestamp()
        });
        fetchAnnouncements();
    } catch (error) {
        alert('Error updating status');
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

                            <div className="flex items-center gap-2 py-2">
                                <input 
                                    type="checkbox" 
                                    name="isDraft" 
                                    id="isDraft"
                                    checked={newAnnouncement.isDraft} 
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-featured-blue rounded border-slate-300 focus:ring-featured-blue"
                                />
                                <label htmlFor="isDraft" className="text-xs font-bold text-amber-600 uppercase tracking-wide cursor-pointer">Save as Draft (Internal Only)</label>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Content</label>
                                <textarea required name="content" value={newAnnouncement.content} onChange={handleInputChange} rows={8} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="Write your message here..." />
                            </div>

                            <button type="submit" disabled={isSubmitting} className={`w-full py-3 ${newAnnouncement.isDraft ? 'bg-amber-500 hover:bg-amber-600' : 'bg-featured-blue hover:bg-featured-green'} text-white font-bold rounded-xl transition-colors disabled:opacity-50`}>
                                {isSubmitting ? 'Processing...' : (newAnnouncement.isDraft ? '💾 Save Draft' : '🚀 Post Announcement')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-6 text-slate-800">Recent Updates ({announcements.length})</h2>
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading news...</div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                            <p className="text-slate-400">No announcements posted yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {announcements.map((ann) => (
                                <div key={ann.id} className={`bg-white p-6 rounded-2xl border ${ann.isDraft ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'} flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group`}>
                                    {ann.imageUrl && (
                                        <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden mb-4 relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={ann.imageUrl} alt={ann.title} className="w-full h-full object-cover" />
                                            {ann.isDraft && (
                                                <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[1px] flex items-center justify-center">
                                                    <span className="bg-amber-500 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Draft Mode</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold text-slate-800">{ann.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleToggleDraft(ann)} className={`p-1.5 rounded-lg transition-all ${ann.isDraft ? 'text-featured-blue hover:bg-featured-blue/10' : 'text-amber-400 hover:bg-amber-50'}`} title={ann.isDraft ? "Publish" : "Move to Draft"}>
                                                {ann.isDraft ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                )}
                                            </button>
                                            <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm whitespace-pre-wrap line-clamp-3">{ann.content}</p>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Posted: {ann.createdAt?.toDate ? ann.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                        </div>
                                        <Link href={`/announcements/${ann.id}`} legacyBehavior>
                                            <a target="_blank" className="text-[10px] font-black text-featured-blue hover:text-featured-green transition-colors uppercase tracking-widest flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                {ann.isDraft ? 'Preview' : 'Live View'}
                                            </a>
                                        </Link>
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
