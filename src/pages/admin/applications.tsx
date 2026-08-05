import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useEffect, useState } from 'react'
import { db } from '../../lib/firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import AdminGuard from '../../components/AdminGuard'

export default function Applications() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchApplications = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "applications"));
      const apps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by status (pending first) then name
      apps.sort((a: any, b: any) => {
        if (a.status === b.status) return a.name.localeCompare(b.name);
        return a.status === 'pending' ? -1 : 1;
      });
      setApplications(apps)
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const filteredApps = applications.filter(app => {
    const searchStr = filter.toLowerCase();
    const teams = app.interests || app.teams || []; // Support both old and new fields
    return (
        app.name?.toLowerCase().includes(searchStr) || 
        app.email?.toLowerCase().includes(searchStr) ||
        teams.some((t: string) => t.toLowerCase().includes(searchStr))
    );
  })

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'accepted': return 'bg-signal-soft text-green-800 border-green-200';
      case 'rejected': return 'bg-accent-orange-soft text-ember border-ember';
      default: return 'bg-accent-orange-soft text-ember border-accent-orange-soft';
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-canvas font-sans text-ink">
        <Navbar />
        
        <section className="pt-72 pb-12 bg-ink text-white border-b border-ink">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">Applications</h1>
              <p className="text-ink-muted">Review and manage incoming membership requests.</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-deep">{applications.length}</div>
              <div className="text-xs uppercase tracking-widest text-ink-soft font-bold">Total Apps</div>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-6 py-12">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder="Search by name, email, or team..." 
                className="w-full pl-10 pr-4 py-3 border border-line focus:ring-2 focus:ring-deep outline-none"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <svg className="w-5 h-5 text-ink-muted absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <button onClick={fetchApplications} className="px-4 py-3 bg-white border border-line text-ink-soft hover:bg-canvas font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Refresh
            </button>
          </div>

          <div className="bg-white border border-line overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-ink-soft">Loading applications...</div>
            ) : filteredApps.length === 0 ? (
              <div className="p-12 text-center text-ink-soft">No applications found matching your search.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-canvas border-b border-line text-xs uppercase tracking-wider text-ink-soft font-bold">
                      <th className="p-6">Applicant</th>
                      <th className="p-6">Academic Info</th>
                      <th className="p-6">Interests</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredApps.map(app => (
                      <tr key={app.id} className="hover:bg-canvas/30 transition-colors group">
                        <td className="p-6">
                          <div className="font-bold text-ink">{app.name}</div>
                          <div className="text-sm text-ink-soft">{app.email}</div>
                          {app.phone && <div className="text-xs text-ink-muted mt-1">{app.phone}</div>}
                        </td>
                        <td className="p-6">
                          <div className="text-sm font-medium text-ink">{app.major}</div>
                          <div className="text-xs text-ink-muted">Year {app.year}</div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-wrap gap-1">
                            {(app.interests || app.teams)?.map((team: string) => (
                              <span key={team} className="px-2 py-0.5 bg-line text-ink-soft text-[9px] font-black uppercase border border-line">
                                {team}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${getStatusColor(app.status || 'pending')}`}>
                            {app.status || 'pending'}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <Link href={`/admin/application/${app.id}`} legacyBehavior>
                            <a className="inline-block px-4 py-2 bg-ink text-white text-[10px] font-black uppercase tracking-widest hover:bg-deep transition-colors">
                              Review
                            </a>
                          </Link>
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