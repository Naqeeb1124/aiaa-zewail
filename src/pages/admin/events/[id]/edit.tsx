import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AdminGuard from '../../../../components/AdminGuard';
import ImageUpload from '../../../../components/ImageUpload';
import Seo from '../../../../components/Seo';

export default function EditEvent() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [event, setEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    category: 'Workshop',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const docRef = doc(db, 'events', id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Extract date and time from the ISO string
        const eventDate = new Date(data.date);
        const dateStr = eventDate.toISOString().split('T')[0];
        const timeStr = eventDate.toTimeString().split(' ')[0].substring(0, 5);

        setEvent({
          title: data.title || '',
          date: dateStr,
          time: timeStr,
          location: data.location || '',
          category: data.category || 'Workshop',
          description: data.description || '',
          imageUrl: data.imageUrl || ''
        });
      } else {
        alert('Event not found');
        router.push('/admin/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEvent(prevState => ({ ...prevState, [name]: value }));
  };

  const handleImageUploadSuccess = (url: string) => {
    setEvent(prevState => ({ ...prevState, imageUrl: url }));
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const combinedDateTime = new Date(`${event.date}T${event.time}`);
      
      const updatedData = {
        ...event,
        date: combinedDateTime.toISOString(),
      };

      await updateDoc(doc(db, 'events', id as string), updatedData);
      alert('Event updated successfully!');
      router.push('/admin/events');
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Seo title="Edit Event - Admin" />
        <Navbar />

        <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter">Edit Event</h1>
            <p className="text-slate-400 font-medium">Update the details for "{event.title}"</p>
          </div>
        </section>

        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100">
            <form onSubmit={handleUpdateEvent} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Event Title</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={event.title}
                  onChange={handleInputChange}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-bold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Date</label>
                  <input
                    required
                    type="date"
                    name="date"
                    value={event.date}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Time</label>
                  <input
                    required
                    type="time"
                    name="time"
                    value={event.time}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Location</label>
                  <input
                    required
                    type="text"
                    name="location"
                    value={event.location}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Category</label>
                  <select
                    name="category"
                    value={event.category}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-bold text-slate-800"
                  >
                    <option>Workshop</option>
                    <option>Ceremony</option>
                    <option>Webinar</option>
                    <option>Social</option>
                    <option>Competition</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Cover Image</label>
                <ImageUpload onUploadSuccess={handleImageUploadSuccess} initialImageUrl={event.imageUrl} />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Description</label>
                <textarea
                  required
                  name="description"
                  value={event.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-featured-blue outline-none font-medium text-slate-600"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/admin/events')}
                  className="flex-1 py-4 px-6 rounded-full border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 px-6 bg-featured-blue text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-featured-green transition-all shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Event'}
                </button>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </AdminGuard>
  );
}
