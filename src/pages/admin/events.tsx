import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useEffect, useState } from 'react'
import { auth, db } from '../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/router'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'

const AUTHORIZED = ['officer1@zewail.edu.eg', 's-abdelrahman.alnaqeeb@zewailcity.edu.eg']

export default function Events() {
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const router = useRouter()

  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, "events"));
    const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEvents(eventsData)
  }

  useEffect(() => {
    onAuthStateChanged(auth, u => {
      setUser(u)
      if (!u || !AUTHORIZED.includes(u.email)) {
        router.push('/join')
      }
    })
  }, [])

  useEffect(() => {
    if (user) {
      fetchEvents()
    }
  }, [user])

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title'),
      date: formData.get('date'),
      description: formData.get('description'),
    }
    await addDoc(collection(db, "events"), data)
    fetchEvents()
    e.currentTarget.reset()
  }

  const handleDeleteEvent = async (id: string) => {
    await deleteDoc(doc(db, "events", id));
    fetchEvents()
  }

  if (!user) return <div className="pt-24">Redirecting to sign-in…</div>
  if (!AUTHORIZED.includes(user.email)) return <div className="pt-24 p-6">You are not authorized.</div>

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Manage Events</h1>
        <div className="mt-6">
          <form onSubmit={handleAddEvent}>
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <div className="mt-1">
                  <input type="text" name="title" id="title" required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                <div className="mt-1">
                  <input type="date" name="date" id="date" required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <div className="mt-1">
                  <textarea id="description" name="description" rows={3} required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0033A0] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Add Event
              </button>
            </div>
          </form>
        </div>
        <div className="mt-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map(event => (
                <tr key={event.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{event.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{event.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDeleteEvent(event.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  )
}
