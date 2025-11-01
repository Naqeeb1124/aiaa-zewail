import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useEffect, useState } from 'react'
import { auth, db } from '../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/router'
import { collection, getDocs } from 'firebase/firestore'

const AUTHORIZED = ['officer1@zewail.edu.eg', 's-abdelrahman.alnaqeeb@zewailcity.edu.eg']

export default function Applications() {
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const router = useRouter()

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
      const fetchApplications = async () => {
        const querySnapshot = await getDocs(collection(db, "applications"));
        const apps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApplications(apps)
      }
      fetchApplications()
    }
  }, [user])

  if (!user) return <div className="pt-24">Redirecting to sign-in…</div>
  if (!AUTHORIZED.includes(user.email)) return <div className="pt-24 p-6">You are not authorized.</div>

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Applications</h1>
        <div className="mt-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Major</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teams</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map(app => (
                <tr key={app.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{app.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{app.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{app.major}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{app.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{app.teams.join(', ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-indigo-600 hover:text-indigo-900">View</a>
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
