import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function Account() {
  const [user, setUser] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)

  useEffect(() => {
    onAuthStateChanged(auth, u => {
      setUser(u)
      if (u) {
        const fetchApplication = async () => {
          const appRef = doc(db, 'applications', u.uid)
          const appSnap = await getDoc(appRef)
          if (appSnap.exists()) {
            setApplication(appSnap.data())
          }
        }
        fetchApplication()
      }
    })
  }, [])

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold">Account Information</h1>
        {user && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Your Details</h2>
            <p><strong>Name:</strong> {user.displayName}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}
        {application && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Your Application</h2>
            {Object.entries(application).map(([key, value]) => (
              <div key={key} className="mb-4">
                <h3 className="text-lg font-semibold capitalize">{key.replace(/_/g, ' ')}</h3>
                <p className="text-gray-700">{Array.isArray(value) ? value.join(', ') : value}</p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
