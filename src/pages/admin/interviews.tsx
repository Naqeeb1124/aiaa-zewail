import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';

interface InterviewItem {
    id: string; // User UID
    status: 'pending' | 'scheduled' | 'done';
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

    const handleMarkDone = async (uid: string) => {
        if(!confirm('Mark this interview as completed?')) return;
        try {
            await updateDoc(doc(db, 'interviews', uid), {
                status: 'done'
            });
            fetchInterviews();
        } catch (error) {
            alert('Error updating status');
        }
    };

    const scheduled = interviews.filter(i => i.status === 'scheduled');
    const pending = interviews.filter(i => i.status === 'pending');
    const completed = interviews.filter(i => i.status === 'done');

    return (
        <AdminGuard>
            <div className="min-h-screen bg-canvas font-sans text-ink">
                <Navbar />
                
                <section className="pt-72 pb-12 bg-ink text-white border-b border-ink">
                    <div className="max-w-7xl mx-auto px-6">
                        <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter">Interview Manager</h1>
                        <p className="text-ink-muted font-bold">Track upcoming mission briefings and pending engagements.</p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                     {/* SCHEDULED SECTION */}
                     <div className="bg-white border border-line overflow-hidden">
                        <div className="p-10 border-b border-line flex justify-between items-center bg-canvas/50">
                            <div>
                                <h2 className="text-2xl font-black text-ink uppercase tracking-tight">Confirmed Briefings</h2>
                                <p className="text-xs text-ink-muted font-bold uppercase mt-1 tracking-widest">{scheduled.length} Engagements Locked</p>
                            </div>
                            <button onClick={fetchInterviews} className="px-6 py-2 bg-white border border-line text-[10px] font-black uppercase tracking-widest hover:bg-canvas transition-all">Refresh Frequency</button>
                        </div>
                        
                        {loading ? (
                            <div className="p-20 text-center text-ink-muted font-black uppercase tracking-[0.2em] animate-pulse">Scanning frequencies...</div>
                        ) : scheduled.length === 0 ? (
                            <div className="p-20 text-center text-ink-muted font-bold uppercase tracking-widest">No confirmed mission briefings.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-canvas text-[10px] uppercase text-ink-muted font-black tracking-[0.2em]">
                                        <tr>
                                            <th className="p-8">Time & Date</th>
                                            <th className="p-8">Candidate</th>
                                            <th className="p-8">Location</th>
                                            <th className="p-8 text-right">Protocol</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {scheduled.sort((a,b) => new Date(a.selectedSlot!).getTime() - new Date(b.selectedSlot!).getTime()).map(interview => (
                                            <tr key={interview.id} className="hover:bg-canvas/30 transition-colors">
                                                <td className="p-8 font-black text-ink">
                                                    {new Date(interview.selectedSlot!).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="p-8">
                                                    <div className="font-bold text-ink">{interview.applicantEmail}</div>
                                                    <div className="text-[10px] font-mono text-ink-muted mt-1">{interview.id}</div>
                                                </td>
                                                <td className="p-8">
                                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${interview.location?.toLowerCase().includes('online') ? 'bg-accent-orange-soft text-ember border border-accent-orange-soft' : 'bg-line text-deep border border-line'}`}>
                                                        {interview.location}
                                                    </span>
                                                </td>
                                                <td className="p-8 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleMarkDone(interview.id)}
                                                            className="px-4 py-2 bg-growth text-white text-[10px] font-black uppercase tracking-widest   transition-all"
                                                        >
                                                            Done
                                                        </button>
                                                        <button 
                                                            onClick={() => handleCancelInterview(interview.id)}
                                                            className="px-4 py-2 border border-accent-orange-soft text-ember text-[10px] font-black uppercase tracking-widest hover:bg-accent-orange-soft transition-all"
                                                        >
                                                            Reset
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                     </div>

                     {/* COMPLETED SECTION */}
                     {completed.length > 0 && (
                        <div className="bg-white border border-line overflow-hidden opacity-60">
                            <div className="p-10 border-b border-line flex justify-between items-center bg-canvas/30">
                                <div>
                                    <h2 className="text-xl font-black text-ink-soft uppercase tracking-tight">Completed Briefings</h2>
                                    <p className="text-[10px] text-ink-muted font-bold uppercase mt-1 tracking-widest">{completed.length} Missions Accomplished</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-canvas text-[9px] uppercase text-ink-muted font-black tracking-[0.2em]">
                                        <tr>
                                            <th className="p-8">Time & Date</th>
                                            <th className="p-8">Candidate</th>
                                            <th className="p-8 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {completed.map(interview => (
                                            <tr key={interview.id}>
                                                <td className="p-8 text-ink-soft font-bold">
                                                    {new Date(interview.selectedSlot!).toLocaleString()}
                                                </td>
                                                <td className="p-8">
                                                    <div className="font-bold text-ink-soft">{interview.applicantEmail}</div>
                                                </td>
                                                <td className="p-8 text-right">
                                                    <Link href={`/admin/application/${interview.id}`} legacyBehavior>
                                                        <a className="text-[10px] font-black uppercase tracking-widest text-ink-muted hover:text-deep hover:underline">Review App</a>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                     )}

                     {/* PENDING SECTION */}
                     <div className="bg-white border border-line overflow-hidden opacity-80">
                        <div className="p-10 border-b border-line flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-ink-soft uppercase tracking-tight">Pending Selection</h2>
                                <p className="text-[10px] text-ink-muted font-bold uppercase mt-1 tracking-widest">{pending.length} Invitations Sent</p>
                            </div>
                        </div>
                        
                        {!loading && pending.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-canvas text-[9px] uppercase text-ink-muted font-black tracking-[0.2em]">
                                        <tr>
                                            <th className="p-8">Candidate</th>
                                            <th className="p-8">Proposed Windows</th>
                                            <th className="p-8 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {pending.map(interview => (
                                            <tr key={interview.id}>
                                                <td className="p-8">
                                                    <div className="font-bold text-ink-soft">{interview.applicantEmail}</div>
                                                </td>
                                                <td className="p-8">
                                                    <div className="flex flex-wrap gap-2">
                                                        {interview.slots?.map((s, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-canvas border border-line text-[9px] font-bold text-ink-muted uppercase">
                                                                {new Date(s.time).toLocaleDateString()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-8 text-right">
                                                    <Link href={`/admin/application/${interview.id}`} legacyBehavior>
                                                        <a className="text-[10px] font-black uppercase tracking-widest text-deep hover:underline">View App</a>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                     </div>

                     <div className="p-10 bg-deep text-white flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="max-w-xl text-center md:text-left">
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Recruitment Pipeline</h3>
                            <p className="text-deep-light font-medium opacity-80">To invite more applicants, browse the secure candidate database and initiate screening protocols.</p>
                        </div>
                        <Link href="/admin/applications" legacyBehavior>
                            <a className="px-10 py-4 bg-white text-deep font-black uppercase tracking-widest text-xs hover:bg-growth hover:text-white transition-all">
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
