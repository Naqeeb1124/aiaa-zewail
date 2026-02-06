import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import AdminGuard from '../../../../components/AdminGuard';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import { QRCodeSVG } from 'qrcode.react';

export default function EventRegistrations() {
    const router = useRouter();
    const { id } = router.query;
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showQR, setShowQR] = useState(false);
    const [checkInUrl, setCheckInUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && id) {
            setCheckInUrl(`${window.location.origin}/events/${id}/check-in`);
        }

        if (!id) return;

        const fetchData = async () => {
            try {
                // Fetch event details
                const eventDoc = await getDoc(doc(db, 'events', id as string));
                if (eventDoc.exists()) {
                    setEvent({ id: eventDoc.id, ...eventDoc.data() });
                }

                // Fetch registrations
                const q = query(collection(db, 'registrations'), where('eventId', '==', id));
                const querySnapshot = await getDocs(q);
                const regs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setRegistrations(regs);
            } catch (error) {
                console.error("Error fetching registrations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const filteredRegistrations = registrations.filter(reg => 
        reg.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        reg.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleAttendance = async (regId: string, currentStatus: string) => {
        setProcessingId(regId);
        const newStatus = currentStatus === 'attended' ? 'registered' : 'attended';
        try {
            await updateDoc(doc(db, 'registrations', regId), {
                status: newStatus
            });
            setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status: newStatus } : r));
        } catch (error) {
            alert("Failed to update status");
        } finally {
            setProcessingId(null);
        }
    };

    const handleExportCSV = () => {
        if (registrations.length === 0) return;
        
        const headers = ["Name", "Email", "Status", "Registered At"];
        const rows = registrations.map(r => [
            r.userName,
            r.userEmail,
            r.status,
            r.registeredAt
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `registrations-${event?.title || 'event'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <Navbar />
                
                <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-extrabold mb-2">Event Registrations</h1>
                            <p className="text-slate-400">Viewing attendees for: <span className="text-zewail-cyan font-bold">{event?.title}</span></p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowQR(true)}
                                className="px-6 py-2 bg-featured-blue text-white font-bold rounded-xl hover:bg-featured-green transition-all text-sm flex items-center gap-2"
                            >
                                <span>📱</span> Show Check-in QR
                            </button>
                            <button 
                                onClick={handleExportCSV}
                                className="px-6 py-2 bg-zewail-cyan text-white font-bold rounded-xl hover:bg-opacity-90 transition-all text-sm"
                            >
                                Export to CSV
                            </button>
                        </div>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <button 
                            onClick={() => router.back()}
                            className="text-featured-blue font-bold flex items-center gap-2 hover:underline"
                        >
                            ← Back to Events
                        </button>
                        
                        <div className="w-full md:w-96 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                            <input 
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none bg-white shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">Attendee List ({filteredRegistrations.length})</h2>
                            <div className="flex gap-4 text-xs font-black uppercase tracking-widest text-slate-400">
                                <span>Checked in: <span className="text-emerald-600">{registrations.filter(r => r.status === 'attended').length}</span></span>
                                <span>Pending: <span className="text-amber-600">{registrations.filter(r => r.status !== 'attended').length}</span></span>
                            </div>
                        </div>
                        
                        {registrations.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">No one has registered for this event yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold">
                                        <tr>
                                            <th className="p-6">Name</th>
                                            <th className="p-6">Email</th>
                                            <th className="p-6">Status</th>
                                            <th className="p-6 text-center">Attendance</th>
                                            <th className="p-6 text-right">Registered At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredRegistrations.sort((a,b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).map(reg => (
                                            <tr key={reg.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="p-6 font-bold text-slate-800">
                                                    {reg.userName}
                                                </td>
                                                <td className="p-6 text-slate-600">
                                                    {reg.userEmail}
                                                </td>
                                                <td className="p-6">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${reg.status === 'attended' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {reg.status}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-center">
                                                    <button 
                                                        disabled={processingId === reg.id}
                                                        onClick={() => toggleAttendance(reg.id, reg.status)}
                                                        className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${reg.status === 'attended' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                                    >
                                                        {processingId === reg.id ? '...' : (reg.status === 'attended' ? 'Cancel Check-in' : 'Check In')}
                                                    </button>
                                                </td>
                                                <td className="p-6 text-right text-slate-500 text-sm">
                                                    {new Date(reg.registeredAt).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>

                {/* QR Code Modal */}
                {showQR && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowQR(false)}></div>
                        <div className="bg-white rounded-[40px] shadow-2xl p-12 max-w-sm w-full relative z-10 text-center animate-in fade-in zoom-in duration-300">
                            <button onClick={() => setShowQR(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Check-in QR</h3>
                            <p className="text-slate-500 text-sm mb-8">Scan to automatically record attendance for <br/><strong>{event?.title}</strong></p>
                            
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-inner flex justify-center mb-8">
                                <QRCodeSVG value={checkInUrl} size={200} />
                            </div>

                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 py-2 rounded-lg">
                                {checkInUrl}
                            </p>
                        </div>
                    </div>
                )}

                <Footer />
            </div>
        </AdminGuard>
    );
}