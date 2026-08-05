import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, getDocs, updateDoc, doc, query } from 'firebase/firestore'
import AdminGuard from '../../components/AdminGuard'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function ManageMembers() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pointsInput, setPointsInput] = useState<number>(0)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      // POINTING TO MEMBERS COLLECTION
      const q = query(collection(db, 'members')) 
      const querySnapshot = await getDocs(q)
      const memberList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMembers(memberList)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching members:", error)
      setLoading(false)
    }
  }

  const handleEditPoints = (member: any) => {
    setEditingId(member.id)
    setPointsInput(member.points || 0)
  }

  const handleSavePoints = async (id: string) => {
    try {
      // UPDATING MEMBERS COLLECTION
      const memberRef = doc(db, 'members', id)
      await updateDoc(memberRef, {
        points: Number(pointsInput)
      })
      setEditingId(null)
      fetchMembers()
    } catch (error) {
      console.error("Error updating points:", error)
      alert("Failed to update points.")
    }
  }

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(filter.toLowerCase()) || 
    m.email?.toLowerCase().includes(filter.toLowerCase()) ||
    m.studentId?.includes(filter)
  )

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Student ID', 'Points'];
    const rows = filteredMembers.map(m => [m.name, m.email, m.studentId || '', m.points || 0]);
    const csvContent = "data:text/csv;charset=utf-8," +
        [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "aiaa_members.csv");
    document.body.appendChild(link);
    link.click();
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-canvas font-sans text-ink">
        <Navbar />
        
        <section className="pt-72 pb-12 bg-ink text-white border-b border-ink">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">Official Member Database</h1>
              <p className="text-ink-muted">Manage accepted members and track participation points.</p>
            </div>
            <button onClick={exportCSV} className="bg-signal-soft hover:bg-growth text-white px-6 py-2 font-bold transition-colors flex items-center gap-2">
                <span>📊</span> Export CSV
            </button>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-8 flex justify-between items-center">
                <input 
                    type="text" 
                    placeholder="Search by name, email, or ID..." 
                    className="w-full md:w-1/2 px-4 py-3 border border-line focus:ring-2 focus:ring-deep outline-none"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <div className="text-sm font-bold text-ink-soft">
                    Showing {filteredMembers.length} Members
                </div>
            </div>

            <div className="bg-white border border-line overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-ink-soft">Loading directory...</div>
                ) : filteredMembers.length === 0 ? (
                    <div className="p-12 text-center text-ink-soft flex flex-col items-center">
                        <span className="text-4xl mb-4">📭</span>
                        <p>No official members found. Applicants will appear here once accepted.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-canvas text-xs uppercase text-ink-soft font-bold border-b border-line">
                                <tr>
                                    <th className="p-6">Member</th>
                                    <th className="p-6">Contact</th>
                                    <th className="p-6">Points</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {filteredMembers.map(member => (
                                    <tr key={member.id} className="hover:bg-canvas transition-colors">
                                        <td className="p-6">
                                            <div className="font-bold text-ink">{member.name}</div>
                                            <div className="text-xs text-ink-soft uppercase font-bold tracking-wider">{member.studentId || 'No ID'}</div>
                                        </td>
                                        <td className="p-6 text-sm text-ink-soft">
                                            {member.email}
                                        </td>
                                        <td className="p-6">
                                            {editingId === member.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="number" 
                                                        value={pointsInput} 
                                                        onChange={(e) => setPointsInput(Number(e.target.value))}
                                                        className="w-20 px-2 py-1 border"
                                                    />
                                                    <button onClick={() => handleSavePoints(member.id)} className="text-growth text-sm font-bold">Save</button>
                                                </div>
                                            ) : (
                                                <div className="font-bold text-deep text-lg">{member.points || 0}</div>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <button 
                                                onClick={() => handleEditPoints(member)} 
                                                className="text-ink-muted hover:text-deep font-bold text-sm"
                                            >
                                                Edit Points
                                            </button>
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