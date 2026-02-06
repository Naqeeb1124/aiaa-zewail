import React, { useState, useEffect } from 'react';
import AdminGuard from '../../components/AdminGuard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { auth } from '../../lib/firebase';

const CATEGORIES: Record<string, { label: string, roles: string[] }> = {
    event: {
        label: "Event / Workshop",
        roles: ["Participant", "Speaker", "Organizer", "Volunteer", "Attendee"]
    },
    project: {
        label: "Technical Project",
        roles: ["Project Lead", "Active Member", "Core Contributor", "Researcher", "Developer"]
    },
    competition: {
        label: "Competition",
        roles: ["Winner", "Runner-up", "Finalist", "Participant", "Honorable Mention"]
    },
    leadership: {
        label: "Leadership / Board",
        roles: ["Head of Team", "Vice Head", "Executive Member", "Board Member", "Team Lead"]
    }
};

export default function AdminCertificates() {
    const [formData, setFormData] = useState({
        name: '',
        eventTitle: '',
        date: new Date().toISOString().split('T')[0],
        role: 'Participant',
        category: 'event'
    });
    const [loading, setLoading] = useState(false);

    // Sync role when category changes to the first available role in that category
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            role: CATEGORIES[prev.category].roles[0]
        }));
    }, [formData.category]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                alert('You must be logged in to generate certificates.');
                return;
            }
            const token = await user.getIdToken();

            const response = await fetch('/api/certificates/generate', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `certificate-${formData.name.replace(/\s+/g, '-')}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                const errorData = await response.json();
                alert(`Failed: ${errorData.message || 'Error generating certificate'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating certificate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <Navbar />
                
                <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
                    <div className="max-w-4xl mx-auto px-6">
                        <h1 className="text-4xl font-extrabold mb-2">Certificate Generator</h1>
                        <p className="text-slate-400">Issue official documentation for members, leads, and event attendees.</p>
                    </div>
                </section>

                <main className="max-w-4xl mx-auto px-6 py-12">
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-slate-200">
                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl border border-amber-100">
                                🏅
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">New Certificate</h2>
                                <p className="text-slate-500">Select a category and fill in details to generate a branded PDF.</p>
                            </div>
                        </div>

                        <form onSubmit={handleGenerate} className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Recipient Name</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g. Abdelrahman Mohamed" 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none transition-all" 
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Event / Project / Competition Name</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="eventTitle" 
                                    value={formData.eventTitle} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g. CanSat Competition 2024" 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none transition-all" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Date Issued</label>
                                <input 
                                    required 
                                    type="date" 
                                    name="date" 
                                    value={formData.date} 
                                    onChange={handleInputChange} 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none transition-all" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
                                <select 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleInputChange} 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none transition-all bg-slate-50"
                                >
                                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                                        <option key={key} value={key}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Role / Achievement</label>
                                <select 
                                    name="role" 
                                    value={formData.role} 
                                    onChange={handleInputChange} 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none transition-all"
                                >
                                    {CATEGORIES[formData.category].roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2 mt-6">
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full py-4 bg-featured-blue text-white font-bold rounded-xl hover:bg-featured-green transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Generating Document...
                                        </>
                                    ) : 'Generate & Download PDF'}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
                <Footer />
            </div>
        </AdminGuard>
    );
}