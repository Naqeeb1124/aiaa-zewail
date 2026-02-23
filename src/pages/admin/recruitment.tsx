import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RecruitmentCenter() {
    const [config, setConfig] = useState({
        open: false,
        cycleName: '',
        startDate: '',
        endDate: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // Using 'recruitment/status' to match what's used in join.tsx props
                const docRef = doc(db, 'recruitment', 'status');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Map isOpen to open if only isOpen exists (for backward compatibility)
                    setConfig({
                        open: data.open ?? data.isOpen ?? false,
                        cycleName: data.cycleName || '',
                        startDate: data.startDate || '',
                        endDate: data.endDate || '',
                    });
                }
            } catch (error) {
                console.error("Error fetching recruitment status:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        
        try {
            // Save both field names for maximum compatibility during transition
            const dataToSave = {
                ...config,
                isOpen: config.open // Keep isOpen for any legacy components
            };
            await setDoc(doc(db, 'recruitment', 'status'), dataToSave, { merge: true });
            setMessage({ type: 'success', text: 'Recruitment settings updated successfully.' });
        } catch (error) {
            console.error("Error updating recruitment status:", error);
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = () => {
        setConfig(prev => ({ ...prev, open: !prev.open }));
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <Navbar />

                <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
                    <div className="max-w-5xl mx-auto px-6">
                        <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter leading-none">Recruitment Center</h1>
                        <p className="text-slate-400 font-medium italic">Control application access and mission timelines.</p>
                    </div>
                </section>

                <main className="max-w-5xl mx-auto px-6 py-12">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-4 border-featured-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Scanning status...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Status Card */}
                            <div className="md:col-span-1">
                                <div className={`p-10 rounded-[40px] border-2 text-center transition-all ${config.open ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-200'}`}>
                                    <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-4xl shadow-sm ${config.open ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                        {config.open ? '🔓' : '🔒'}
                                    </div>
                                    <h2 className={`text-2xl font-black mb-2 uppercase tracking-tight ${config.open ? 'text-emerald-800' : 'text-slate-700'}`}>
                                        {config.open ? 'ACTIVE' : 'HALTED'}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10 leading-relaxed">
                                        {config.open 
                                            ? "Applications are currently being accepted on the Join page." 
                                            : "The Join page is currently locked for all applicants."}
                                    </p>
                                    <button 
                                        onClick={toggleStatus}
                                        type="button"
                                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95 transform hover:-translate-y-1 ${config.open ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-featured-green hover:bg-featured-blue shadow-emerald-200'} text-white`}
                                    >
                                        {config.open ? 'Shutdown Access' : 'Initiate Access'}
                                    </button>
                                </div>
                            </div>

                            {/* Configuration Form */}
                            <div className="md:col-span-2">
                                <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                                    <h3 className="text-xl font-bold text-slate-800 mb-6">Season Configuration</h3>
                                    
                                    {message && (
                                        <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {message.text}
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Cycle Name</label>
                                            <input 
                                                type="text" 
                                                value={config.cycleName}
                                                onChange={e => setConfig({...config, cycleName: e.target.value})}
                                                placeholder="e.g. Spring 2026 Recruitment"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                                                <input 
                                                    type="date" 
                                                    value={config.startDate}
                                                    onChange={e => setConfig({...config, startDate: e.target.value})}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                                                <input 
                                                    type="date" 
                                                    value={config.endDate}
                                                    onChange={e => setConfig({...config, endDate: e.target.value})}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={saving}
                                            className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save Configuration'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
                <Footer />
            </div>
        </AdminGuard>
    );
}
