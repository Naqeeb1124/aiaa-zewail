import { useState, useEffect } from 'react'
import { db, auth as clientAuth } from '../../lib/firebase'
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore'
import AdminGuard from '../../components/AdminGuard'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function UserDirectory() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    // Fetch all users without orderBy to avoid skipping documents missing the field
    const q = query(collection(db, 'users'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[]

      // Sort in memory to include users with missing joinedAt at the bottom
      const sortedUsers = userList.sort((a, b) => {
        const dateA = a.joinedAt?.seconds || 0;
        const dateB = b.joinedAt?.seconds || 0;
        return dateB - dateA;
      });

      setUsers(sortedUsers)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching users:", error)
      if (error.code === 'permission-denied') {
        alert("Permission denied. Please ensure you are logged in as an admin.");
      }
      setLoading(false);
    })

    return () => unsubscribe()
  }, [])

  const handleExportCSV = async (filterType?: string) => {
    if (!clientAuth.currentUser) {
      alert('You must be signed in as an admin to export.');
      return;
    }
    
    setExporting(true);
    try {
      const token = await clientAuth.currentUser.getIdToken();
      const url = filterType ? `/api/admin/export-users?filter=${filterType}` : '/api/admin/export-users';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const fileName = filterType === 'students' ? 'aiaa-students-only.csv' : 'aiaa-all-accounts.csv';
      a.download = `${fileName.split('.')[0]}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}.`);
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    // Handle Firestore Timestamp
    if (date instanceof Timestamp) {
      return date.toDate().toLocaleDateString();
    }
    
    // Handle seconds/nanoseconds object (sometimes seen in Firestore data)
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }

    const d = new Date(date);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  }

  const filteredUsers = users.filter(u => {
    const searchStr = filter.toLowerCase();
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(searchStr) || email.includes(searchStr);
  })

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        
        <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold mb-2">Account Directory</h1>
                <p className="text-slate-400">Viewing all users who have signed in to the platform.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => handleExportCSV('students')}
                  disabled={exporting}
                  className="bg-featured-blue hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                  {exporting ? (
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : '🎓'}
                  {exporting ? 'Exporting...' : 'Export Students Only'}
                </button>
                <button 
                  onClick={() => handleExportCSV()}
                  disabled={exporting}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  {exporting ? (
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : '📥'}
                  {exporting ? 'Exporting...' : 'Export All (95)'}
                </button>
                <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 leading-none">Total</div>
                  <div className="text-2xl font-black text-white leading-none">{users.length}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-8 flex justify-between items-center">
                <div className="relative w-full md:w-1/2">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-featured-blue/5 focus:border-featured-blue outline-none shadow-sm transition-all"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    {filteredUsers.length} results
                  </p>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-24 text-center">
                        <div className="w-12 h-12 border-4 border-featured-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing with Firebase...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-24 text-center">
                        <div className="text-4xl mb-4">🔍</div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No users match your search</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-black border-b border-slate-100">
                                <tr>
                                    <th className="p-6 w-16">#</th>
                                    <th className="p-6">User Details</th>
                                    <th className="p-6">Email Address</th>
                                    <th className="p-6">Joined Date</th>
                                    <th className="p-6 text-right">Access Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-6 text-xs font-bold text-slate-300 group-hover:text-featured-blue transition-colors">
                                            {filteredUsers.length - index}
                                        </td>
                                        <td className="p-6">
                                            <div className="font-bold text-slate-900 group-hover:text-featured-blue transition-colors">{user.name || 'Anonymous'}</div>
                                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user.id}</div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-sm text-slate-600 font-medium">{user.email}</span>
                                        </td>
                                        <td className="p-6">
                                            <div className="text-sm text-slate-600 font-bold">{formatDate(user.joinedAt)}</div>
                                            <div className="text-[10px] text-slate-400 uppercase font-black mt-0.5">Last Login: {formatDate(user.lastLogin)}</div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
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
