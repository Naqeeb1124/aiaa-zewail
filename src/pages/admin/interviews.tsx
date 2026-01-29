import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface InterviewItem {
    id: string;
    status: 'pending' | 'scheduled';
    selectedSlot?: string;
    location?: string;
    [key: string]: any;
}

export default function AdminInterviews() {
    const [interviews, setInterviews] = useState<InterviewItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInterviews = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'interviews'));
            const items: InterviewItem[] = querySnapshot.docs.map((d) => {
                const data = d.data();
                return {
                    id: d.id, // User UID
                    status: data.status,
                    selectedSlot: data.selectedSlot,
                    location: data.location,
                    ...data
                } as InterviewItem;
            });

            // Filter for only scheduled or pending
            setInterviews(items.filter(i => i.status === 'scheduled' || i.status === 'pending'));
        } catch (error) {
            console.error("Error fetching interviews:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInterviews();
    }, []);

    const handleCancelInterview = async (uid: string) => {
        if(!confirm('Are you sure you want to cancel this interview?')) return;
        try {
            await updateDoc(doc(db, 'interviews', uid), {
                status: 'pending',
                selectedSlot: null
            });
            fetchInterviews();
        } catch (error) {
            alert('Error cancelling interview');
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <Navbar />
                
                <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-6">
                        <h1 className="text-4xl font-extrabold mb-2">Interview Manager</h1>
                        <p className="text-slate-400">Track upcoming interviews and manage schedules.</p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 py-12">
                     <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">Scheduled Interviews</h2>
                            <button onClick={fetchInterviews} className="text-featured-blue font-bold text-sm">Refresh List</button>
                        </div>
                        
                        {loading ? (
                            <div className="p-12 text-center text-slate-500">Loading schedule...</div>
                        ) : interviews.filter(i => i.status === 'scheduled').length === 0 ? (
                            <div className="p-12 text-center text-slate-500">No interviews are currently scheduled.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold">
                                        <tr>
                                            <th className="p-6">Time Slot</th>
                                            <th className="p-6">Applicant ID</th>
                                            <th className="p-6">Location</th>
                                            <th className="p-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {interviews.filter(i => i.status === 'scheduled').sort((a,b) => new Date(a.selectedSlot).getTime() - new Date(b.selectedSlot).getTime()).map(interview => (
                                            <tr key={interview.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="p-6 font-bold text-slate-800">
                                                    {new Date(interview.selectedSlot).toLocaleString()}
                                                </td>
                                                <td className="p-6 font-mono text-sm text-slate-600">
                                                    {interview.id}
                                                </td>
                                                <td className="p-6 text-sm text-slate-600">
                                                    {interview.location}
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button 
                                                        onClick={() => handleCancelInterview(interview.id)}
                                                        className="text-red-500 font-bold text-sm hover:underline"
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                     </div>

                     <div className="mt-12 p-8 bg-blue-50 rounded-3xl border border-blue-100">
                        <h3 className="text-xl font-bold text-blue-900 mb-2">Invite Applicants</h3>
                        <p className="text-blue-700 mb-6">To invite an applicant to interview, go to the <Link href="/admin/applications" legacyBehavior><a className="underline font-bold">Applications</a></Link> page, review their application, and click &quot;Invite to Interview&quot;.</p>
                     </div>
                </main>
                <Footer />
            </div>
        </AdminGuard>
    );
}
