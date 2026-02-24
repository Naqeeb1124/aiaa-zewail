import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAdmin } from '../../hooks/useAdmin';

const SUPER_ADMIN_EMAIL = 's-abdelrahman.alnaqeeb@zewailcity.edu.eg';

export default function BlackBox() {
    const { user, loading: authLoading } = useAdmin();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && user?.email === SUPER_ADMIN_EMAIL) {
            const fetchLogs = async () => {
                try {
                    const q = query(
                        collection(db, 'audit_logs'), 
                        orderBy('timestamp', 'desc'),
                        limit(100)
                    );
                    const snap = await getDocs(q);
                    setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                } catch (error) {
                    console.error("Error fetching logs:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchLogs();
        }
    }, [user, authLoading]);

    if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (user?.email !== SUPER_ADMIN_EMAIL) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center">
                <div className="text-6xl mb-6">🚫</div>
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Access Denied</h1>
                <p className="text-slate-400 max-w-md">The Black Box is restricted to the system architect. Your attempt has been logged.</p>
            </div>
        );
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <Navbar />

                <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Classified / Internal Audit</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase tracking-tighter leading-none">The Black Box</h1>
                        <p className="text-slate-400 font-medium">Monitoring all outgoing transmissions and administrative actions.</p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="font-black text-slate-800 uppercase tracking-tight">Transmission Logs</h2>
                            <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{logs.length} Recent Entries</span>
                        </div>

                        {loading ? (
                            <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Decrypting Logs...</div>
                        ) : logs.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No logs found. System is quiet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em]">
                                        <tr>
                                            <th className="p-6">Timestamp</th>
                                            <th className="p-6">Admin</th>
                                            <th className="p-6">Action / Type</th>
                                            <th className="p-6">Recipient(s)</th>
                                            <th className="p-6">Subject</th>
                                            <th className="p-6">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {logs.map(log => (
                                            <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="p-6 text-xs font-bold text-slate-500 tabular-nums">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="p-6">
                                                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-700">{log.adminEmail}</span>
                                                </td>
                                                <td className="p-6">
                                                    <div className="text-xs font-black uppercase tracking-tight text-slate-800">{log.type}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{log.emailType || 'bulk'}</div>
                                                </td>
                                                <td className="p-6 text-xs font-medium text-slate-600">
                                                    {log.recipient || `${log.recipientCount} recipients`}
                                                </td>
                                                <td className="p-6 text-xs font-bold text-slate-800">
                                                    {log.subject}
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {log.status}
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
    );
}
