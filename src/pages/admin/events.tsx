import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import ImageUpload from '../../components/ImageUpload'; 
import Link from 'next/link';

export default function ManageEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
            ...(newArchivedState ? { isKickoff: false } : {})
        });
        setEvents(prev => prev.map(item => item.id === event.id
            ? { ...item, isArchived: newArchivedState, ...(newArchivedState ? { isKickoff: false } : {}) }
            : item
        ));
        setSelectedIds(prev => prev.filter(id => id !== event.id));
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
  const visibleEventIds = filteredEvents.map(event => event.id);
  const selectedVisibleCount = selectedIds.filter(id => visibleEventIds.includes(id)).length;
  const allVisibleSelected = filteredEvents.length > 0 && selectedVisibleCount === filteredEvents.length;

  const handleSelectAll = () => {
    setSelectedIds(prev => allVisibleSelected
      ? prev.filter(id => !visibleEventIds.includes(id))
      : Array.from(new Set([...prev, ...visibleEventIds]))
    );
  };

  const handleBulkArchive = async (newArchivedState: boolean, ids = selectedIds.filter(id => visibleEventIds.includes(id))) => {
    const idsToUpdate = ids.filter(id => visibleEventIds.includes(id));
    if (idsToUpdate.length === 0) return;
    if (!confirm(`${newArchivedState ? 'Archive' : 'Restore'} ${idsToUpdate.length} selected event${idsToUpdate.length === 1 ? '' : 's'}?`)) return;

    try {
      for (let index = 0; index < idsToUpdate.length; index += 450) {
        const batch = writeBatch(db);
        idsToUpdate.slice(index, index + 450).forEach(id => batch.update(doc(db, 'events', id), {
          isArchived: newArchivedState,
          updatedAt: serverTimestamp(),
          ...(newArchivedState ? { isKickoff: false } : {})
        }));
        await batch.commit();
      }
      setEvents(prev => prev.map(event => idsToUpdate.includes(event.id)
        ? { ...event, isArchived: newArchivedState, ...(newArchivedState ? { isKickoff: false } : {}) }
        : event
      ));
      setSelectedIds(prev => prev.filter(id => !idsToUpdate.includes(id)));
    } catch (error) {
      console.error('Error updating event archive state:', error);
      alert('Error updating selected events');
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-canvas font-sans text-ink">
        <Navbar />
        
        <section className="pt-72 pb-12 bg-ink text-white border-b border-ink">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter">Event Manager</h1>
              <p className="text-ink-muted font-medium">Schedule workshops, webinars, and ceremonies.</p>
            </div>
            <Link href="/events" legacyBehavior>
              <a target="_blank" className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
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
                    <div className="bg-white p-8 border border-line sticky top-32">
                        <h2 className="text-xl font-black mb-6 text-ink uppercase tracking-tight">Create New Event</h2>
                        <form onSubmit={handleAddEvent} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-ink-muted tracking-widest mb-1">Title</label>
                                <input required type="text" name="title" value={newEvent.title} onChange={handleInputChange} className="w-full p-3 bg-canvas border border-line focus:ring-2 focus:ring-deep outline-none font-bold" placeholder="e.g. Intro to Aerodynamics" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-ink-muted tracking-widest mb-1">Date</label>
                                    <input required type="date" name="date" value={newEvent.date} onChange={handleInputChange} className="w-full p-3 bg-canvas border border-line focus:ring-2 focus:ring-deep outline-none font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-ink-muted tracking-widest mb-1">Time</label>
                                    <input required type="time" name="time" value={newEvent.time} onChange={handleInputChange} className="w-full p-3 bg-canvas border border-line focus:ring-2 focus:ring-deep outline-none font-bold" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-ink-muted tracking-widest mb-1">Location</label>
                                    <input required type="text" name="location" value={newEvent.location} onChange={handleInputChange} className="w-full p-3 bg-canvas border border-line focus:ring-2 focus:ring-deep outline-none font-bold" placeholder="e.g. Room 204" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-ink-muted tracking-widest mb-1">Category</label>
                                    <select name="category" value={newEvent.category} onChange={handleInputChange} className="w-full p-3 bg-canvas border border-line focus:ring-2 focus:ring-deep outline-none font-bold">
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
                                    <label className="block text-[10px] font-black uppercase text-ink-muted tracking-widest mb-1">CTA Text</label>
                                    <input type="text" name="ctaText" value={newEvent.ctaText} onChange={handleInputChange} className="w-full p-3 bg-canvas border border-line focus:ring-2 focus:ring-deep outline-none font-bold" placeholder="e.g. Join Meeting" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-ink-muted tracking-widest mb-1">CTA URL</label>
                                    <input type="url" name="ctaUrl" value={newEvent.ctaUrl} onChange={handleInputChange} className="w-full p-3 bg-canvas border border-line focus:ring-2 focus:ring-deep outline-none font-bold" placeholder="https://..." />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-ink-muted tracking-widest mb-1">Cover Image</label>
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
                                        className="w-4 h-4 text-deep border-ink-muted focus:ring-deep"
                                    />
                                    <label htmlFor="isKickoff" className="text-xs font-bold text-ink-soft uppercase tracking-wide cursor-pointer">Set as Home Page Countdown</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        name="isDraft" 
                                        id="isDraft"
                                        checked={newEvent.isDraft} 
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-deep border-ink-muted focus:ring-deep"
                                    />
                                    <label htmlFor="isDraft" className="text-xs font-bold text-ember uppercase tracking-wide cursor-pointer">Save as Draft (Internal Only)</label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-ink-muted tracking-widest mb-1">Description</label>
                                <textarea required name="description" value={newEvent.description} onChange={handleInputChange} rows={4} className="w-full p-3 bg-canvas border border-line focus:ring-2 focus:ring-deep outline-none font-medium" placeholder="Event details..." />
                            </div>

                            <button type="submit" disabled={isSubmitting} className={`w-full py-4 ${newEvent.isDraft ? 'bg-ember hover:bg-ember' : 'bg-deep hover:bg-growth'} text-white font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50`}>
                                {isSubmitting ? 'Processing...' : (newEvent.isDraft ? '[SAVE] Save Draft' : '[/] Publish Event')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-black text-ink uppercase tracking-tight">{showArchived ? 'Archived Events' : 'Upcoming Gatherings'} ({filteredEvents.length})</h2>
                            {filteredEvents.length > 0 && (
                                <label className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ink-muted cursor-pointer w-fit">
                                    <input type="checkbox" checked={allVisibleSelected} onChange={handleSelectAll} className="w-4 h-4 text-deep border-ink-muted focus:ring-deep" />
                                    Select all visible
                                </label>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {!showArchived && filteredEvents.length > 0 && (
                                <button onClick={() => handleBulkArchive(true, visibleEventIds)} className="px-4 py-2 bg-ember text-white text-[10px] font-black uppercase tracking-widest hover:bg-deep transition-all">
                                    Archive all
                                </button>
                            )}
                            {selectedVisibleCount > 0 && (
                                <button onClick={() => handleBulkArchive(!showArchived)} className="px-4 py-2 bg-ember text-white text-[10px] font-black uppercase tracking-widest hover:bg-deep transition-all">
                                    {showArchived ? 'Restore' : 'Archive'} {selectedVisibleCount}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setShowArchived(!showArchived);
                                    setSelectedIds([]);
                                }}
                                className="px-4 py-2 bg-white border border-line text-[10px] font-black uppercase tracking-widest text-ink-soft hover:text-deep hover:border-deep transition-all"
                            >
                                {showArchived ? 'Show Active' : 'Show Archived'}
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-ink-soft font-bold uppercase tracking-widest animate-pulse">Loading events...</div>
                    ) : filteredEvents.length === 0 ? (
                        <div className="text-center py-20 bg-white border border-dashed border-line">
                            <p className="text-ink-muted font-bold uppercase tracking-widest text-xs">No {showArchived ? 'archived' : 'scheduled'} events.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredEvents.map((event) => (
                                <div key={event.id} className={`bg-white p-6 border ${selectedIds.includes(event.id) ? 'border-deep ring-2 ring-deep/10' : event.isDraft ? 'border-accent-orange-soft bg-accent-orange-soft/10' : 'border-line'} flex flex-col md:flex-row gap-6 relative overflow-hidden group`}>
                                    {event.isKickoff && (
                                        <div className="absolute top-0 right-0 bg-sea text-white text-[8px] font-black px-4 py-1 uppercase tracking-[0.2em] transform rotate-45 translate-x-4 translate-y-2">
                                            Home Kickoff
                                        </div>
                                    )}
                                    {event.isArchived && (
                                        <div className="absolute inset-0 bg-ink/5  pointer-events-none z-10"></div>
                                    )}
                                    <div className="w-full md:w-48 h-32 bg-line overflow-hidden relative flex-shrink-0">
                                        {event.imageUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-ink-muted bg-canvas font-black text-xs uppercase">No Image</div>
                                        )}
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur text-[8px] font-black text-deep uppercase tracking-widest">
                                            {event.category}
                                        </div>
                                        {event.isDraft && (
                                            <div className="absolute inset-0 bg-ember/20  flex items-center justify-center">
                                                <span className="bg-ember text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest">Draft</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-ink-muted cursor-pointer w-fit">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(event.id)}
                                                        onChange={() => setSelectedIds(prev => prev.includes(event.id) ? prev.filter(id => id !== event.id) : [...prev, event.id])}
                                                        aria-label={`Select ${event.title}`}
                                                        className="w-4 h-4 text-deep border-ink-muted focus:ring-deep"
                                                    />
                                                    Select
                                                </label>
                                                <h3 className="text-xl font-black text-ink mb-1 uppercase tracking-tight">{event.title}</h3>
                                                <p className={`text-[10px] font-black ${event.isDraft ? 'text-ember' : 'text-growth'} mb-3 uppercase tracking-widest`}>
                                                    {new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {event.location}
                                                </p>
                                                <div className="flex flex-wrap gap-4">
                                                    {!event.isArchived && (
                                                        <Link href={`/admin/events/${event.id}/registrations`} legacyBehavior>
                                                            <a className="text-[10px] font-black text-deep hover:text-growth transition-colors flex items-center gap-1 uppercase tracking-widest">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                                View Registrants
                                                            </a>
                                                        </Link>
                                                    )}
                                                    <Link href={`/events/${event.id}`} legacyBehavior>
                                                        <a target="_blank" className="text-[10px] font-black text-ink-muted hover:text-deep transition-colors flex items-center gap-1 uppercase tracking-widest">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            {event.isDraft ? 'Preview' : 'Live View'}
                                                        </a>
                                                    </Link>
                                                    {event.ctaText && (
                                                        <div className="text-[10px] font-black text-ember flex items-center gap-1 uppercase tracking-widest">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                            CTA: {event.ctaText}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 relative z-20">
                                                <button onClick={() => handleToggleDraft(event)} className={`p-2 transition-all border ${event.isDraft ? 'bg-deep text-white border-deep hover:bg-growth' : 'bg-accent-orange-soft text-ember border-accent-orange-soft hover:bg-accent-orange-soft'}`} title={event.isDraft ? "Publish Now" : "Move to Drafts"}>
                                                    {event.isDraft ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    )}
                                                </button>
                                                <button onClick={() => handleToggleArchive(event)} className="bg-canvas text-ink-muted hover:text-ink-soft p-2 transition-all border border-line" title={event.isArchived ? "Restore" : "Archive"}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                                </button>
                                                <Link href={`/admin/events/${event.id}/edit`} legacyBehavior>
                                                    <a className="bg-canvas text-ink-muted hover:text-deep p-2 transition-all border border-line" title="Edit Details">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </a>
                                                </Link>
                                                <button onClick={() => handleDeleteEvent(event.id)} className="bg-accent-orange-soft text-ember hover:text-ember p-2 transition-all border border-accent-orange-soft" title="Delete Event">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-ink-soft text-sm line-clamp-2 mt-2 font-medium">{event.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-12 p-10 bg-deep text-white flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="max-w-xl text-center md:text-left">
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Marketing & Promotion</h3>
                            <p className="text-deep-light font-medium opacity-80">Ready to spread the word? Use our communication tools to notify all members about upcoming gatherings.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/admin/communications" legacyBehavior>
                                <a className="px-8 py-4 bg-white text-deep font-black uppercase tracking-widest text-[10px] hover:bg-growth hover:text-white transition-all text-center">
                                    Bulk Email
                                </a>
                            </Link>
                            <Link href="/admin/announcements" legacyBehavior>
                                <a className="px-8 py-4 bg-deep-light/20 border border-white/20 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-deep transition-all text-center">
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
