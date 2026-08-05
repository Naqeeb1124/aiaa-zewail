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
            <div className="min-h-screen flex flex-col items-center justify-center bg-ink text-white p-6 text-center">
                <div className="text-6xl mb-6">🚫</div>
                <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Access Denied</h1>
                <p className="text-ink-muted max-w-md">The Black Box is restricted to the system architect. Your attempt has been logged.</p>
            </div>
        );
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-canvas font-sans text-ink">
                <Navbar />

                <section className="pt-72 pb-12 bg-ink text-white border-b border-ink relative overflow-hidden">
                    <div className="absolute inset-0 from-ember/10 to-transparent pointer-events-none"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="w-3 h-3 bg-accent-orange-soft animate-pulse-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-ember">Classified / Internal Audit</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase tracking-tighter leading-none">The Black Box</h1>
                        <p className="text-ink-muted font-medium">Monitoring all outgoing transmissions and administrative actions.</p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="bg-white border border-line overflow-hidden">
                        <div className="p-8 border-b border-line bg-canvas/50 flex justify-between items-center">
                            <h2 className="font-black text-ink uppercase tracking-tight">Transmission Logs</h2>
                            <span className="px-3 py-1 bg-ink text-white text-[10px] font-black uppercase tracking-widest">{logs.length} Recent Entries</span>
                        </div>

                        {loading ? (
                            <div className="p-20 text-center text-ink-muted font-black uppercase tracking-widest animate-pulse">Decrypting Logs...</div>
                        ) : logs.length === 0 ? (
                            <div className="p-20 text-center text-ink-muted font-bold uppercase tracking-widest">No logs found. System is quiet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-canvas text-[10px] uppercase text-ink-muted font-black tracking-[0.2em]">
                                        <tr>
                                            <th className="p-6">Timestamp</th>
                                            <th className="p-6">Admin</th>
                                            <th className="p-6">Action / Type</th>
                                            <th className="p-6">Recipient(s)</th>
                                            <th className="p-6">Subject</th>
                                            <th className="p-6">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {logs.map(log => (
                                            <tr key={log.id} className="hover:bg-canvas/80 transition-colors">
                                                <td className="p-6 text-xs font-bold text-ink-soft tabular-nums">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="p-6">
                                                    <span className="px-3 py-1 bg-line text-[10px] font-black text-ink">{log.adminEmail}</span>
                                                </td>
                                                <td className="p-6">
                                                    <div className="text-xs font-black uppercase tracking-tight text-ink">{log.type}</div>
                                                    <div className="text-[9px] text-ink-muted font-bold uppercase mt-0.5">{log.emailType || 'bulk'}</div>
                                                </td>
                                                <td className="p-6 text-xs font-medium text-ink-soft">
                                                    {log.recipient || `${log.recipientCount} recipients`}
                                                </td>
                                                <td className="p-6 text-xs font-bold text-ink">
                                                    {log.subject}
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-tighter ${log.status === 'success' ? 'bg-signal-soft text-growth' : 'bg-accent-orange-soft text-ember'}`}>
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
