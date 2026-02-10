import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import ImageUpload from '../../components/ImageUpload'; 
import Link from 'next/link';

export default function ManageEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    date: '', 
    time: '',
    location: '',
    category: 'Workshop',
    description: '', 
    imageUrl: '' 
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
    const { name, value } = e.target;
    setNewEvent(prevState => ({ ...prevState, [name]: value }));
  };

  const handleImageUploadSuccess = (url: string) => {
    setNewEvent(prevState => ({ ...prevState, imageUrl: url }));
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    setIsSubmitting(true);
    try {
        // Combine date and time into a single ISO string
        const combinedDateTime = new Date(`${newEvent.date}T${newEvent.time}`);
        
        const eventData = {
            ...newEvent,
            date: combinedDateTime.toISOString(), // Overwrite date with combined ISO string
        };

        const docRef = await addDoc(collection(db, 'events'), eventData);
        setEvents([{ id: docRef.id, ...eventData }, ...events]);
        setNewEvent({ title: '', date: '', time: '', location: '', category: 'Workshop', description: '', imageUrl: '' });
        alert('Event added successfully!');
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

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        
        <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl font-extrabold mb-2">Event Manager</h1>
            <p className="text-slate-400">Schedule workshops, webinars, and ceremonies.</p>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-32">
                        <h2 className="text-xl font-bold mb-6 text-slate-800">Create New Event</h2>
                        <form onSubmit={handleAddEvent} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Title</label>
                                <input required type="text" name="title" value={newEvent.title} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="e.g. Intro to Aerodynamics" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Date</label>
                                    <input required type="date" name="date" value={newEvent.date} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Time</label>
                                    <input required type="time" name="time" value={newEvent.time} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Location</label>
                                    <input required type="text" name="location" value={newEvent.location} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="e.g. Room 204" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
                                    <select name="category" value={newEvent.category} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none">
                                        <option>Workshop</option>
                                        <option>Ceremony</option>
                                        <option>Webinar</option>
                                        <option>Social</option>
                                        <option>Competition</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cover Image</label>
                                <ImageUpload onUploadSuccess={handleImageUploadSuccess} initialImageUrl={newEvent.imageUrl} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
                                <textarea required name="description" value={newEvent.description} onChange={handleInputChange} rows={4} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="Event details..." />
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-featured-blue text-white font-bold rounded-xl hover:bg-featured-green transition-colors disabled:opacity-50">
                                {isSubmitting ? 'Publishing...' : 'Publish Event'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-6 text-slate-800">Upcoming Events ({events.length})</h2>
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading events...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                            <p className="text-slate-400">No events scheduled.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div key={event.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                                    <div className="w-full md:w-48 h-32 bg-slate-100 rounded-xl overflow-hidden relative flex-shrink-0">
                                        {event.imageUrl ? (
                                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">No Image</div>
                                        )}
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-bold text-featured-blue uppercase">
                                            {event.category}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-800 mb-1">{event.title}</h3>
                                                <p className="text-sm font-bold text-featured-green mb-2">{new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {event.location}</p>
                                                <Link href={`/admin/events/${event.id}/registrations`} legacyBehavior>
                                                    <a className="text-xs font-bold text-featured-blue hover:underline flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                        View Registrants
                                                    </a>
                                                </Link>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => handleDeleteEvent(event.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors" title="Delete Event">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                                <Link href={`/admin/events/${event.id}/edit`} legacyBehavior>
                                                    <a className="text-slate-400 hover:text-featured-blue p-2 transition-colors" title="Edit Event">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </a>
                                                </Link>
                                            </div>
                                        </div>
                                        <p className="text-slate-500 text-sm line-clamp-2">{event.description}</p>
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
