import React, { useState, useEffect } from 'react';
import AdminGuard from '../../components/AdminGuard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { auth } from '../../lib/firebase';

const CATEGORIES: Record<string, { label: string, roles: string[] }> = {
    event: {
        label: "Event / Workshop",
        roles: ["Participant", "Speaker", "Organizer", "Volunteer", "Attendee", "Mentor", "Instructor"]
    },
    webinar: {
        label: "Webinar",
        roles: ["Attendee", "Guest Speaker", "Moderator", "Organizer"]
    },
    project: {
        label: "Technical Project",
        roles: ["Project Lead", "Active Member", "Core Contributor", "Researcher", "Developer", "Junior Developer", "Intern"]
    },
    competition: {
        label: "Competition",
        roles: ["Winner", "Runner-up", "Finalist", "Participant", "Honorable Mention", "Judge", "Technical Committee"]
    },
    leadership: {
        label: "Leadership / Board",
        roles: ["Chairperson", "Vice Chair", "Head of Team", "Vice Head", "Executive Member", "Board Member", "Team Lead", "Specialist"]
    },
    appreciation: {
        label: "Appreciation / Merit",
        roles: ["Outstanding Contribution", "Member of the Month", "Excellence Award", "Service Award"]
    }
};

export default function AdminCertificates() {
    const [formData, setFormData] = useState({
        name: '',
        eventTitle: '',
        date: new Date().toISOString().split('T')[0],
        role: 'Participant',
        category: 'event',
        customWording: ''
    });
    const [loading, setLoading] = useState(false);

    // Sync role when category changes to the first available role in that category
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            role: CATEGORIES[prev.category].roles[0]
        }));
    }, [formData.category]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            <div className="min-h-screen bg-canvas font-sans text-ink">
                <Navbar />
                
                <section className="pt-72 pb-12 bg-ink text-white border-b border-ink">
                    <div className="max-w-4xl mx-auto px-6">
                        <h1 className="text-4xl font-extrabold mb-2">Certificate Generator</h1>
                        <p className="text-ink-muted">Issue official documentation for members, leads, and event attendees.</p>
                    </div>
                </section>

                <main className="max-w-4xl mx-auto px-6 py-12">
                    <div className="bg-white p-8 md:p-12 border border-line">
                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-line">
                            <div className="w-20 h-20 bg-accent-orange-soft flex items-center justify-center text-4xl border border-accent-orange-soft">
                                🏅
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-ink">New Certificate</h2>
                                <p className="text-ink-soft">Select a category and fill in details to generate a branded PDF.</p>
                            </div>
                        </div>

                        <form onSubmit={handleGenerate} className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Recipient Name</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g. Abdelrahman Mohamed" 
                                    className="w-full px-4 py-3 border border-line focus:ring-2 focus:ring-deep outline-none transition-all" 
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Event / Project / Competition Name</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="eventTitle" 
                                    value={formData.eventTitle} 
                                    onChange={handleInputChange} 
                                    placeholder="e.g. CanSat Competition 2024" 
                                    className="w-full px-4 py-3 border border-line focus:ring-2 focus:ring-deep outline-none transition-all" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Date Issued</label>
                                <input 
                                    required 
                                    type="date" 
                                    name="date" 
                                    value={formData.date} 
                                    onChange={handleInputChange} 
                                    className="w-full px-4 py-3 border border-line focus:ring-2 focus:ring-deep outline-none transition-all" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Category</label>
                                <select 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleInputChange} 
                                    className="w-full px-4 py-3 border border-line focus:ring-2 focus:ring-deep outline-none transition-all bg-canvas"
                                >
                                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                                        <option key={key} value={key}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Role / Achievement</label>
                                <select 
                                    name="role" 
                                    value={formData.role} 
                                    onChange={handleInputChange} 
                                    className="w-full px-4 py-3 border border-line focus:ring-2 focus:ring-deep outline-none transition-all"
                                >
                                    {CATEGORIES[formData.category].roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                    <option value="custom">-- Custom Role --</option>
                                </select>
                            </div>

                            {formData.role === 'custom' && (
                                <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Enter Custom Role</label>
                                    <input 
                                        type="text" 
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        placeholder="e.g. Lead System Architect" 
                                        className="w-full px-4 py-3 border border-line focus:ring-2 focus:ring-deep outline-none transition-all" 
                                    />
                                </div>
                            )}

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Custom Description (Optional Override)</label>
                                <textarea 
                                    name="customWording" 
                                    value={formData.customWording} 
                                    onChange={handleInputChange} 
                                    placeholder="Leave empty for default wording based on category." 
                                    rows={2}
                                    className="w-full px-4 py-3 border border-line focus:ring-2 focus:ring-deep outline-none transition-all resize-none" 
                                />
                                <p className="text-[10px] text-ink-muted mt-1 font-medium">This replaces the &quot;has successfully...&quot; part. Use if you need a specific sentence.</p>
                            </div>

                            <div className="md:col-span-2 mt-6">
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full py-4 bg-deep text-white font-bold hover:bg-growth transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin"></div>
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