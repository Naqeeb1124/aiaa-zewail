import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import AdminGuard from '../../components/AdminGuard'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function UserDirectory() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users')) 
      const querySnapshot = await getDocs(q)
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(userList)
      setLoading(false)
    } catch (error: any) {
      console.error("Error fetching users:", error)
      if (error.code === 'permission-denied') {
        alert("Permission denied. Please ensure you are logged in as an admin.");
      }
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(filter.toLowerCase()) || 
    u.email?.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        
        <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-4xl font-extrabold mb-2">Account Directory</h1>
            <p className="text-slate-400">Viewing all {users.length} users who have signed in to the platform.</p>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-8 flex justify-between items-center">
                <input 
                    type="text" 
                    placeholder="Search accounts..." 
                    className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none shadow-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">Loading directory...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No users found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="p-6">User</th>
                                    <th className="p-6">Email</th>
                                    <th className="p-6">Joined Webapp</th>
                                    <th className="p-6 text-right">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-6">
                                            <div className="font-bold text-slate-900">{user.name}</div>
                                            <div className="text-xs text-slate-400 font-mono">{user.id}</div>
                                        </td>
                                        <td className="p-6 text-sm text-slate-600">
                                            {user.email}
                                        </td>
                                        <td className="p-6 text-sm text-slate-500">
                                            {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
        <Footer />
      </div>
    </AdminGuard>
  )
}
