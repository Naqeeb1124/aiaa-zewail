import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';

interface InterviewItem {
    id: string; // User UID
    status: 'pending' | 'scheduled';
    selectedSlot?: string;
    location?: string;
    slots?: Array<{time: string, location: string}>;
    applicantEmail?: string;
    [key: string]: any;
}

export default function AdminInterviews() {
    const [interviews, setInterviews] = useState<InterviewItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInterviews = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'interviews'));
            const items: InterviewItem[] = querySnapshot.docs.map((d) => ({
                id: d.id,
                ...d.data()
            } as InterviewItem));

            setInterviews(items);
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
        if(!confirm('Are you sure you want to cancel/reset this interview?')) return;
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

    const scheduled = interviews.filter(i => i.status === 'scheduled');
    const pending = interviews.filter(i => i.status === 'pending');

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <Navbar />
                
                <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-6">
                        <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter">Interview Manager</h1>
                        <p className="text-slate-400 font-bold">Track upcoming mission briefings and pending engagements.</p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                     {/* SCHEDULED SECTION */}
                     <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Confirmed Briefings</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-widest">{scheduled.length} Engagements Locked</p>
                            </div>
                            <button onClick={fetchInterviews} className="px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Refresh Frequency</button>
                        </div>
                        
                        {loading ? (
                            <div className="p-20 text-center text-slate-400 font-black uppercase tracking-[0.2em] animate-pulse">Scanning frequencies...</div>
                        ) : scheduled.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No confirmed mission briefings.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em]">
                                        <tr>
                                            <th className="p-8">Time & Date</th>
                                            <th className="p-8">Candidate</th>
                                            <th className="p-8">Location</th>
                                            <th className="p-8 text-right">Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {scheduled.sort((a,b) => new Date(a.selectedSlot!).getTime() - new Date(b.selectedSlot!).getTime()).map(interview => (
                                            <tr key={interview.id} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="p-8 font-black text-slate-800">
                                                    {new Date(interview.selectedSlot!).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="p-8">
                                                    <div className="font-bold text-slate-700">{interview.applicantEmail}</div>
                                                    <div className="text-[10px] font-mono text-slate-400 mt-1">{interview.id}</div>
                                                </td>
                                                <td className="p-8">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${interview.location?.toLowerCase().includes('online') ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                        {interview.location}
                                                    </span>
                                                </td>
                                                <td className="p-8 text-right">
                                                    <button 
                                                        onClick={() => handleCancelInterview(interview.id)}
                                                        className="px-4 py-2 border border-red-100 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        Reset
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                     </div>

                     {/* PENDING SECTION */}
                     <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden opacity-80">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-slate-600 uppercase tracking-tight">Pending Selection</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{pending.length} Invitations Sent</p>
                            </div>
                        </div>
                        
                        {!loading && pending.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[9px] uppercase text-slate-400 font-black tracking-[0.2em]">
                                        <tr>
                                            <th className="p-8">Candidate</th>
                                            <th className="p-8">Proposed Windows</th>
                                            <th className="p-8 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pending.map(interview => (
                                            <tr key={interview.id}>
                                                <td className="p-8">
                                                    <div className="font-bold text-slate-500">{interview.applicantEmail}</div>
                                                </td>
                                                <td className="p-8">
                                                    <div className="flex flex-wrap gap-2">
                                                        {interview.slots?.map((s, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-400 uppercase">
                                                                {new Date(s.time).toLocaleDateString()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-8 text-right">
                                                    <Link href={`/admin/application/${interview.id}`} legacyBehavior>
                                                        <a className="text-[10px] font-black uppercase tracking-widest text-featured-blue hover:underline">View App</a>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                     </div>

                     <div className="p-10 bg-featured-blue rounded-[40px] text-white flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="max-w-xl text-center md:text-left">
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Recruitment Pipeline</h3>
                            <p className="text-featured-blue-light font-medium opacity-80">To invite more applicants, browse the secure candidate database and initiate screening protocols.</p>
                        </div>
                        <Link href="/admin/applications" legacyBehavior>
                            <a className="px-10 py-4 bg-white text-featured-blue rounded-full font-black uppercase tracking-widest text-xs hover:bg-featured-green hover:text-white transition-all shadow-xl">
                                Browse Applications
                            </a>
                        </Link>
                     </div>
                </main>
                <Footer />
            </div>
        </AdminGuard>
    );
}
