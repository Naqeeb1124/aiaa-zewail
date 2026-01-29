import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../../../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import AdminGuard from '../../../../components/AdminGuard';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';

export default function EventRegistrations() {
    const router = useRouter();
    const { id } = router.query;
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                        <button 
                            onClick={handleExportCSV}
                            className="px-6 py-2 bg-zewail-cyan text-white font-bold rounded-xl hover:bg-opacity-90 transition-all text-sm"
                        >
                            Export to CSV
                        </button>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 py-12">
                    <button 
                        onClick={() => router.back()}
                        className="mb-8 text-featured-blue font-bold flex items-center gap-2 hover:underline"
                    >
                        ← Back to Events
                    </button>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-800">Attendee List ({registrations.length})</h2>
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
                                            <th className="p-6 text-right">Registered At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {registrations.sort((a,b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).map(reg => (
                                            <tr key={reg.id} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="p-6 font-bold text-slate-800">
                                                    {reg.userName}
                                                </td>
                                                <td className="p-6 text-slate-600">
                                                    {reg.userEmail}
                                                </td>
                                                <td className="p-6">
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                                        {reg.status}
                                                    </span>
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
                <Footer />
            </div>
        </AdminGuard>
    );
}
