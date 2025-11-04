import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function Account() {
  const [user, setUser] = useState<any>(null)
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    major: '',
    year: '',
    studentId: '',
    portfolioLink: '',
  })
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        const fetchUserInfo = async () => {
          const docRef = doc(db, 'users', user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setUserInfo(docSnap.data() as any)
          }
        }
        fetchUserInfo()
      } else {
        setUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleUpdate = async () => {
    if (user) {
      const docRef = doc(db, 'users', user.uid)
      await setDoc(docRef, userInfo, { merge: true })
      setEditing(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value })
  }

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold">Account</h1>
        {user ? (
          <div className="mt-6">
            {editing ? (
              <div>
                <div className="flex flex-col space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={userInfo.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className="p-2 border rounded"
                  />
                  <input
                    type="email"
                    name="email"
                    value={userInfo.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="p-2 border rounded"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={userInfo.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    name="studentId"
                    value={userInfo.studentId}
                    onChange={handleChange}
                    placeholder="Student ID"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    name="portfolioLink"
                    value={userInfo.portfolioLink}
                    onChange={handleChange}
                    placeholder="Portfolio Link"
                    className="p-2 border rounded"
                  />
                  <select
                    name="major"
                    value={userInfo.major}
                    onChange={handleSelectChange}
                    className="p-2 border rounded"
                  >
                    <option value="">Select Major</option>
                    <optgroup label="School of Engineering (ENGR)">
                      <option>Aerospace Engineering</option>
                      <option>Communications and Information Engineering</option>
                      <option>Environmental Engineering</option>
                      <option>Nanotechnology and Nanoelectronics Engineering</option>
                      <option>Renewable Energy Engineering</option>
                    </optgroup>
                    <optgroup label="School of Computational Sciences & Artificial Intelligence (CSAI)">
                      <option>Software Development</option>
                      <option>Data Science & Artificial Intelligence</option>
                      <option>Information Technology</option>
                    </optgroup>
                    <optgroup label="School of Science (SCI)">
                      <option>Biomedical Sciences</option>
                      <option>Nanoscience</option>
                      <option>Physics of Universe</option>
                    </optgroup>
                  </select>
                  <select
                    name="year"
                    value={userInfo.year}
                    onChange={handleSelectChange}
                    className="p-2 border rounded"
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </div>
                <button
                  onClick={handleUpdate}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="mt-4 ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <p>
                  <strong>Name:</strong> {userInfo.name}
                </p>
                <p>
                  <strong>Email:</strong> {userInfo.email}
                </p>
                <p>
                  <strong>Phone:</strong> {userInfo.phone}
                </p>
                <p>
                  <strong>Student ID:</strong> {userInfo.studentId}
                </p>
                <p>
                  <strong>Portfolio Link:</strong> {userInfo.portfolioLink}
                </p>
                <p>
                  <strong>Major:</strong> {userInfo.major}
                </p>
                <p>
                  <strong>Year:</strong> {userInfo.year}
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ) : (
          <p>Please log in to view your account information.</p>
        )}
      </main>
      <Footer />
    </div>
  )
}
