import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RecruitmentCenter() {
    const [config, setConfig] = useState({
        isOpen: false,
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
                    setConfig(docSnap.data() as any);
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
            await setDoc(doc(db, 'recruitment', 'status'), config, { merge: true });
            setMessage({ type: 'success', text: 'Recruitment settings updated successfully.' });
        } catch (error) {
            console.error("Error updating recruitment status:", error);
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async () => {
        const newState = !config.isOpen;
        setConfig(prev => ({ ...prev, isOpen: newState }));
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <Navbar />

                <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
                    <div className="max-w-5xl mx-auto px-6">
                        <h1 className="text-4xl font-extrabold mb-2">Recruitment Center</h1>
                        <p className="text-slate-400">Control application access and season timelines.</p>
                    </div>
                </section>

                <main className="max-w-5xl mx-auto px-6 py-12">
                    {loading ? (
                        <div className="text-center py-12">Loading settings...</div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Status Card */}
                            <div className="md:col-span-1">
                                <div className={`p-8 rounded-3xl border-2 text-center transition-all ${config.isOpen ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-200'}`}>
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm ${config.isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                        {config.isOpen ? '🔓' : '🔒'}
                                    </div>
                                    <h2 className={`text-2xl font-bold mb-2 ${config.isOpen ? 'text-emerald-800' : 'text-slate-700'}`}>
                                        {config.isOpen ? 'Recruitment OPEN' : 'Recruitment CLOSED'}
                                    </h2>
                                    <p className="text-sm text-slate-500 mb-8">
                                        {config.isOpen 
                                            ? "Applications are currently being accepted on the Join page." 
                                            : "The Join page is currently locked."}
                                    </p>
                                    <button 
                                        onClick={toggleStatus}
                                        type="button"
                                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${config.isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                    >
                                        {config.isOpen ? 'Close Recruitment' : 'Open Recruitment'}
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
