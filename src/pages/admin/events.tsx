import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, updateDoc, serverTimestamp } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import ImageUpload from '../../components/ImageUpload'; 
import Link from 'next/link';

export default function ManageEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    date: '', 
    time: '',
    location: '',
    category: 'Workshop',
    description: '', 
    imageUrl: '',
    ctaText: '',
    ctaUrl: '',
    isKickoff: false,
    isArchived: false,
    isDraft: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      setEvents(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setNewEvent(prevState => ({ ...prevState, [name]: val }));
  };

  const handleImageUploadSuccess = (url: string) => {
    setNewEvent(prevState => ({ ...prevState, imageUrl: url }));
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    setIsSubmitting(true);
    try {
        const combinedDateTime = new Date(`${newEvent.date}T${newEvent.time}`);
        
        const eventData = {
            ...newEvent,
            date: combinedDateTime.toISOString(),
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'events'), eventData);
        setEvents([{ id: docRef.id, ...eventData }, ...events]);
        setNewEvent({ 
            title: '', date: '', time: '', location: '', 
            category: 'Workshop', description: '', imageUrl: '', 
            ctaText: '', ctaUrl: '',
            isKickoff: false, isArchived: false, isDraft: false
        });
        alert(eventData.isDraft ? 'Draft saved successfully!' : 'Event published successfully!');
    } catch (error) {
        console.error("Error adding event:", error);
        alert('Failed to add event.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if(!confirm('Are you sure you want to delete this event?')) return;
    try {
        await deleteDoc(doc(db, 'events', id));
        setEvents(events.filter(event => event.id !== id));
    } catch (error) {
        alert('Error deleting event.');
    }
  };

  const handleToggleArchive = async (event: any) => {
    const newArchivedState = !event.isArchived;
    if (!confirm(`${newArchivedState ? 'Archive' : 'Restore'} this event?`)) return;
    try {
        const eventRef = doc(db, 'events', event.id);
        await updateDoc(eventRef, {
            isArchived: newArchivedState,
            updatedAt: serverTimestamp(),
            // If archiving, we probably want to remove it from home page kickoff
            ...(newArchivedState ? { isKickoff: false } : {})
        });
        fetchEvents();
    } catch (error) {
        alert('Error updating archive state');
    }
  };

  const handleToggleDraft = async (event: any) => {
    const newDraftState = !event.isDraft;
    if (!confirm(`${newDraftState ? 'Move to Drafts?' : 'Publish this event?'}`)) return;
    try {
        const eventRef = doc(db, 'events', event.id);
        await updateDoc(eventRef, {
            isDraft: newDraftState,
            updatedAt: serverTimestamp()
        });
        fetchEvents();
    } catch (error) {
        alert('Error updating status');
    }
  };

  const filteredEvents = events.filter(e => !!e.isArchived === showArchived);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        
        <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter">Event Manager</h1>
              <p className="text-slate-400 font-medium">Schedule workshops, webinars, and ceremonies.</p>
            </div>
            <Link href="/events" legacyBehavior>
              <a target="_blank" className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                <span>View Public Page</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </Link>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 sticky top-32">
                        <h2 className="text-xl font-black mb-6 text-slate-800 uppercase tracking-tight">Create New Event</h2>
                        <form onSubmit={handleAddEvent} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Title</label>
                                <input required type="text" name="title" value={newEvent.title} onChange={handleInputChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-bold" placeholder="e.g. Intro to Aerodynamics" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Date</label>
                                    <input required type="date" name="date" value={newEvent.date} onChange={handleInputChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Time</label>
                                    <input required type="time" name="time" value={newEvent.time} onChange={handleInputChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-bold" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Location</label>
                                    <input required type="text" name="location" value={newEvent.location} onChange={handleInputChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-bold" placeholder="e.g. Room 204" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Category</label>
                                    <select name="category" value={newEvent.category} onChange={handleInputChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-bold">
                                        <option>Workshop</option>
                                        <option>Ceremony</option>
                                        <option>Webinar</option>
                                        <option>Social</option>
                                        <option>Competition</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">CTA Text</label>
                                    <input type="text" name="ctaText" value={newEvent.ctaText} onChange={handleInputChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-bold" placeholder="e.g. Join Meeting" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">CTA URL</label>
                                    <input type="url" name="ctaUrl" value={newEvent.ctaUrl} onChange={handleInputChange} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-bold" placeholder="https://..." />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Cover Image</label>
                                <ImageUpload onUploadSuccess={handleImageUploadSuccess} initialImageUrl={newEvent.imageUrl} />
                            </div>

                            <div className="flex flex-col gap-2 py-2">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        name="isKickoff" 
                                        id="isKickoff"
                                        checked={newEvent.isKickoff} 
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-featured-blue rounded border-slate-300 focus:ring-featured-blue"
                                    />
                                    <label htmlFor="isKickoff" className="text-xs font-bold text-slate-600 uppercase tracking-wide cursor-pointer">Set as Home Page Countdown</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        name="isDraft" 
                                        id="isDraft"
                                        checked={newEvent.isDraft} 
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-featured-blue rounded border-slate-300 focus:ring-featured-blue"
                                    />
                                    <label htmlFor="isDraft" className="text-xs font-bold text-amber-600 uppercase tracking-wide cursor-pointer">Save as Draft (Internal Only)</label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Description</label>
                                <textarea required name="description" value={newEvent.description} onChange={handleInputChange} rows={4} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-medium" placeholder="Event details..." />
                            </div>

                            <button type="submit" disabled={isSubmitting} className={`w-full py-4 ${newEvent.isDraft ? 'bg-amber-500 hover:bg-amber-600' : 'bg-featured-blue hover:bg-featured-green'} text-white font-black uppercase tracking-widest text-xs rounded-full transition-all shadow-lg disabled:opacity-50`}>
                                {isSubmitting ? 'Processing...' : (newEvent.isDraft ? '💾 Save Draft' : '🚀 Publish Event')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{showArchived ? 'Archived Events' : 'Upcoming Gatherings'} ({filteredEvents.length})</h2>
                        <button 
                            onClick={() => setShowArchived(!showArchived)}
                            className="px-4 py-2 rounded-full bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-featured-blue hover:border-featured-blue transition-all shadow-sm"
                        >
                            {showArchived ? 'Show Active' : 'Show Archived'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest animate-pulse">Loading events...</div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No {showArchived ? 'archived' : 'scheduled'} events.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredEvents.map((event) => (
                                <div key={event.id} className={`bg-white p-6 rounded-3xl border ${event.isDraft ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'} flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow relative overflow-hidden group`}>
                                    {event.isKickoff && (
                                        <div className="absolute top-0 right-0 bg-zewail-cyan text-white text-[8px] font-black px-4 py-1 uppercase tracking-[0.2em] transform rotate-45 translate-x-4 translate-y-2 shadow-sm">
                                            Home Kickoff
                                        </div>
                                    )}
                                    {event.isArchived && (
                                        <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] pointer-events-none z-10"></div>
                                    )}
                                    <div className="w-full md:w-48 h-32 bg-slate-100 rounded-2xl overflow-hidden relative flex-shrink-0">
                                        {event.imageUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 font-black text-xs uppercase">No Image</div>
                                        )}
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[8px] font-black text-featured-blue uppercase tracking-widest">
                                            {event.category}
                                        </div>
                                        {event.isDraft && (
                                            <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[1px] flex items-center justify-center">
                                                <span className="bg-amber-500 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Draft</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800 mb-1 uppercase tracking-tight">{event.title}</h3>
                                                <p className={`text-[10px] font-black ${event.isDraft ? 'text-amber-600' : 'text-featured-green'} mb-3 uppercase tracking-widest`}>
                                                    {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {event.location}
                                                </p>
                                                <div className="flex flex-wrap gap-4">
                                                    {!event.isArchived && (
                                                        <Link href={`/admin/events/${event.id}/registrations`} legacyBehavior>
                                                            <a className="text-[10px] font-black text-featured-blue hover:text-featured-green transition-colors flex items-center gap-1 uppercase tracking-widest">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                                View Registrants
                                                            </a>
                                                        </Link>
                                                    )}
                                                    <Link href={`/events/${event.id}`} legacyBehavior>
                                                        <a target="_blank" className="text-[10px] font-black text-slate-400 hover:text-featured-blue transition-colors flex items-center gap-1 uppercase tracking-widest">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            {event.isDraft ? 'Preview' : 'Live View'}
                                                        </a>
                                                    </Link>
                                                    {event.ctaText && (
                                                        <div className="text-[10px] font-black text-amber-600 flex items-center gap-1 uppercase tracking-widest">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                            CTA: {event.ctaText}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 relative z-20">
                                                <button onClick={() => handleToggleDraft(event)} className={`p-2 rounded-xl transition-all border ${event.isDraft ? 'bg-featured-blue text-white border-featured-blue hover:bg-featured-green' : 'bg-amber-50 text-amber-500 border-amber-100 hover:bg-amber-100'}`} title={event.isDraft ? "Publish Now" : "Move to Drafts"}>
                                                    {event.isDraft ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    )}
                                                </button>
                                                <button onClick={() => handleToggleArchive(event)} className="bg-slate-50 text-slate-300 hover:text-slate-600 p-2 rounded-xl transition-all border border-slate-100" title={event.isArchived ? "Restore" : "Archive"}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                                </button>
                                                <Link href={`/admin/events/${event.id}/edit`} legacyBehavior>
                                                    <a className="bg-slate-50 text-slate-400 hover:text-featured-blue p-2 rounded-xl transition-all border border-slate-100" title="Edit Details">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </a>
                                                </Link>
                                                <button onClick={() => handleDeleteEvent(event.id)} className="bg-red-50 text-red-300 hover:text-red-600 p-2 rounded-xl transition-all border border-red-100" title="Delete Event">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-slate-500 text-sm line-clamp-2 mt-2 font-medium">{event.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-12 p-10 bg-featured-blue rounded-[40px] text-white flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="max-w-xl text-center md:text-left">
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Marketing & Promotion</h3>
                            <p className="text-featured-blue-light font-medium opacity-80">Ready to spread the word? Use our communication tools to notify all members about upcoming gatherings.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/admin/communications" legacyBehavior>
                                <a className="px-8 py-4 bg-white text-featured-blue rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-featured-green hover:text-white transition-all shadow-xl text-center">
                                    Bulk Email
                                </a>
                            </Link>
                            <Link href="/admin/announcements" legacyBehavior>
                                <a className="px-8 py-4 bg-featured-blue-light/20 border border-white/20 text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-featured-blue transition-all text-center">
                                    Post Update
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
        <Footer />
      </div>
    </AdminGuard>
  );
}
