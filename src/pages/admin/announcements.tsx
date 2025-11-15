import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { useRouter } from 'next/router';

export default function Announcements() {
  const AUTHORIZED = ['s-zeina.tawab@zewailcity.edu.eg', 'mdraz@zewailcity.edu.eg', 's-abdelrahman.alnaqeeb@zewailcity.edu.eg', 's-omar.elmetwalli@zewailcity.edu.eg', 's-asmaa.shahine@zewailcity.edu.eg', 'aeltaweel@zewailcity.edu.eg', 'mabdelshafy@zewailcity.edu.eg'];
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', imageUrl: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u && AUTHORIZED.includes(u.email)) {
        setUser(u);
        setIsAdmin(true);
      } else {
        router.push('/');
      }
    });

    const fetchAnnouncements = async () => {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setAnnouncements(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchAnnouncements();
    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAnnouncement(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAddAnnouncement = async () => {
    if (newAnnouncement.title.trim() === '' || newAnnouncement.content.trim() === '') return;

    const docRef = await addDoc(collection(db, 'announcements'), {
      ...newAnnouncement,
      createdAt: new Date(),
    });

    setAnnouncements([{ id: docRef.id, ...newAnnouncement, createdAt: new Date() }, ...announcements]);
    setNewAnnouncement({ title: '', content: '', imageUrl: '' });

    const usersSnapshot = await getDocs(collection(db, 'users'));
    usersSnapshot.forEach(async (userDoc) => {
      const user = userDoc.data();
      if (user.subscribedToAnnouncements !== false) {
        const unsubscribeUrl = `${window.location.origin}/api/unsubscribe?userId=${userDoc.id}`;
        const emailBody = `A new announcement has been posted: ${newAnnouncement.title}\n\n${newAnnouncement.content.substring(0, 150)}...\n\nRead more on our website.\n\nTo unsubscribe from future announcements, click here: ${unsubscribeUrl}`;
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            subject: `New Announcement: ${newAnnouncement.title}`,
            text: emailBody,
          }),
        });
      }
    });
  };

  const handleDeleteAnnouncement = async (id: string) => {
    await deleteDoc(doc(db, 'announcements', id));
    setAnnouncements(announcements.filter(ann => ann.id !== id));
  };

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold">Manage Announcements</h1>
        {isAdmin && (
          <div className="mt-6">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                name="title"
                value={newAnnouncement.title}
                onChange={handleInputChange}
                placeholder="Announcement Title"
                className="p-2 border rounded"
              />
              <input
                type="text"
                name="imageUrl"
                value={newAnnouncement.imageUrl}
                onChange={handleInputChange}
                placeholder="Image URL (optional)"
                className="p-2 border rounded"
              />
              <textarea
                name="content"
                value={newAnnouncement.content}
                onChange={handleInputChange}
                placeholder="Announcement Content"
                className="p-2 border rounded"
                rows={6}
              />
              <button onClick={handleAddAnnouncement} className="px-4 py-2 rounded bg-[#0033A0] text-white">
                Add Announcement
              </button>
            </div>
            <div className="mt-6">
              <h2 className="text-2xl font-bold">Existing Announcements</h2>
              <ul className="mt-4 flex flex-col gap-4">
                {announcements.map((ann) => (
                  <li key={ann.id} className="p-4 border rounded flex justify-between items-center">
                    <p>{ann.title}</p>
                    <button onClick={() => handleDeleteAnnouncement(ann.id)} className="px-4 py-2 rounded bg-red-600 text-white">
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
