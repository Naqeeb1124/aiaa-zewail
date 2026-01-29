import { useState, useEffect } from 'react'
import { db, auth } from '../../lib/firebase'
import { collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore'
import AdminGuard from '../../components/AdminGuard'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { approveRequest, rejectRequest, manualAddMember } from '../../lib/projects'
import { JoinRequest } from '../../types/project'

export default function ReviewRequests() {
    const [requests, setRequests] = useState<JoinRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const q = query(collection(db, 'joinRequests'))
            const querySnapshot = await getDocs(q)
            const reqList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            } as JoinRequest))
            
            reqList.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0
                const dateB = b.createdAt?.seconds || 0
                return dateB - dateA
            })
            
            setRequests(reqList)
        } catch (error) {
            console.error("Error fetching requests:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (req: JoinRequest) => {
        if (!confirm(`Approve ${req.userName} for ${req.projectTitle}?`)) return

        setProcessingId(req.id)
        try {
            const adminId = auth.currentUser?.uid || 'admin'
            await approveRequest(req.id, adminId)
            alert("Approved successfully")
            // Update local state to reflect change
            setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'accepted' as const } : r))
        } catch (error: any) {
            console.error("Error approving:", error)
            alert(`Failed to approve: ${error.message}`)
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (req: JoinRequest) => {
        if (!confirm(`Reject ${req.userName}?`)) return

        setProcessingId(req.id)
        try {
            const adminId = auth.currentUser?.uid || 'admin'
            await rejectRequest(req.id, adminId)
            alert("Rejected successfully")
            // Update local state to reflect change
            setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'rejected' as const } : r))
        } catch (error: any) {
            console.error("Error rejecting:", error)
            alert(`Failed to reject: ${error.message}`)
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <Navbar />

                <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-6">
                        <h1 className="text-4xl font-extrabold mb-2">Join Requests</h1>
                        <p className="text-slate-400">Review and manage member applications for projects.</p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 py-12">
                    {loading ? (
                        <div className="text-center py-12">Loading requests...</div>
                    ) : requests.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200">
                            <p className="text-slate-500 text-xl">No requests found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {requests.map((req) => (
                                <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-all">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-lg text-slate-800">{req.userName}</h3>
                                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">{req.studentId}</span>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        <div className="text-slate-500 text-sm mb-2">
                                            Applying for <span className="font-bold text-featured-blue">{req.projectTitle}</span>
                                            {req.projectType === 'Flagship' && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded">Flagship</span>}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {req.userEmail} &bull; {req.semester}
                                        </div>
                                    </div>

                                    {req.status === 'pending' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleReject(req)}
                                                disabled={processingId === req.id}
                                                className="px-6 py-2 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(req)}
                                                disabled={processingId === req.id}
                                                className="px-6 py-2 rounded-xl bg-featured-blue text-white font-bold hover:bg-featured-green transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
                                            >
                                                {processingId === req.id ? 'Processing...' : 'Approve'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                <Footer />
            </div>
        </AdminGuard>
    )
}
