import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { useRouter } from 'next/router';
import ImageUpload from '../../components/ImageUpload'; // Import the new component

export default function ManageEvents() {
  const AUTHORIZED = ['s-zeina.tawab@zewailcity.edu.eg', 'mdraz@zewailcity.edu.eg', 's-abdelrahman.alnaqeeb@zewailcity.edu.eg', 's-omar.elmetwalli@zewailcity.edu.eg', 's-asmaa.shahine@zewailcity.edu.eg', 'aeltaweel@zewailcity.edu.eg', 'mabdelshafy@zewailcity.edu.eg'];
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '', imageUrl: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u && AUTHORIZED.includes(u.email)) {
        setUser(u);
        setIsAdmin(true);
      } else {
        router.push('/');
      }
    });

    const fetchEvents = async () => {
      const q = query(collection(db, 'events'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      setEvents(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchEvents();
    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prevState => ({ ...prevState, [name]: value }));
  };

  const handleImageUploadSuccess = (url: string) => {
    setNewEvent(prevState => ({ ...prevState, imageUrl: url }));
  };

  const handleAddEvent = async () => {
    if (newEvent.title.trim() === '' || newEvent.date.trim() === '' || newEvent.description.trim() === '') return;

    const docRef = await addDoc(collection(db, 'events'), {
      ...newEvent,
    });

    setEvents([{ id: docRef.id, ...newEvent }, ...events]);
    setNewEvent({ title: '', date: '', description: '', imageUrl: '' });

    // Send email to all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.forEach(async (userDoc) => {
      const user = userDoc.data();
      if (user.subscribedToAnnouncements !== false) {
        const unsubscribeUrl = `${window.location.origin}/api/unsubscribe?userId=${userDoc.id}`;
        const eventDate = new Date(newEvent.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const emailBody = `A new event has been scheduled: ${newEvent.title}\n\nDate: ${eventDate}\n\n${newEvent.description}\n\nFor more details, visit our website.\n\nTo unsubscribe from future notifications, click here: ${unsubscribeUrl}`;
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            subject: `New AIAA Event: ${newEvent.title}`,
            text: emailBody,
          }),
        });
      }
    });
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteDoc(doc(db, 'events', id));
    setEvents(events.filter(event => event.id !== id));
  };

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold">Manage Events</h1>
        {isAdmin && (
          <div className="mt-6">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                placeholder="Event Title"
                className="p-2 border rounded"
              />
              <input
                type="date"
                name="date"
                value={newEvent.date}
                onChange={handleInputChange}
                placeholder="Event Date"
                className="p-2 border rounded"
              />
              <ImageUpload onUploadSuccess={handleImageUploadSuccess} initialImageUrl={newEvent.imageUrl} />
              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                placeholder="Event Description"
                className="p-2 border rounded"
                rows={6}
              />
              <button onClick={handleAddEvent} className="px-4 py-2 rounded bg-featured-blue text-white hover:bg-featured-green transition-colors">
                Add Event
              </button>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-bold">Existing Events</h2>
              <ul className="mt-4 flex flex-col gap-4">
                {events.map((event) => (
                  <li key={event.id} className="p-4 border rounded flex justify-between items-center">
                    <p>{event.title}</p>
                    <button onClick={() => handleDeleteEvent(event.id)} className="px-4 py-2 rounded bg-red-600 text-white">
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}