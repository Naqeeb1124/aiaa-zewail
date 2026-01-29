import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';

export default function ManageOpportunities() {
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        organization: '',
        type: 'internship',
        location: '',
        deadline: '',
        description: '',
        link: '',
        tags: ''
    });

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            const q = query(collection(db, 'opportunities'), orderBy('deadline', 'asc'));
            const querySnapshot = await getDocs(q);
            setOpportunities(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching opportunities:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const dataToSave = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            };
            await addDoc(collection(db, 'opportunities'), dataToSave);
            setFormData({ title: '', organization: '', type: 'internship', location: '', deadline: '', description: '', link: '', tags: '' });
            fetchOpportunities();
            alert('Opportunity added successfully!');
        } catch (error: any) {
            console.error("Error adding opportunity:", error);
            alert(`Failed to add opportunity: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this opportunity?')) return;
        try {
            await deleteDoc(doc(db, 'opportunities', id));
            setOpportunities(opportunities.filter(op => op.id !== id));
        } catch (error) {
            alert('Error deleting opportunity.');
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <Navbar />
                
                <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-6">
                        <h1 className="text-4xl font-extrabold mb-2">Career Hub Manager</h1>
                        <p className="text-slate-400">Add and manage internships, scholarships, and competitions.</p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-32">
                                <h2 className="text-xl font-bold mb-6 text-slate-800">Post New Opportunity</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Title</label>
                                        <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="e.g. Summer Internship" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Organization</label>
                                        <input required type="text" name="organization" value={formData.organization} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="e.g. NASA, SpaceX" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Type</label>
                                            <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none">
                                                <option value="internship">Internship</option>
                                                <option value="scholarship">Scholarship</option>
                                                <option value="competition">Competition</option>
                                                <option value="research">Research</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Deadline</label>
                                            <input required type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Location</label>
                                        <input required type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="e.g. Remote, Cairo, USA" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Application Link</label>
                                        <input required type="url" name="link" value={formData.link} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tags (comma separated)</label>
                                        <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="Space, Engineering, Fully Funded" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Brief Description</label>
                                        <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="Short summary..." />
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-featured-blue text-white font-bold rounded-xl hover:bg-featured-green transition-colors disabled:opacity-50">
                                        {isSubmitting ? 'Posting...' : 'Post Opportunity'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* List */}
                        <div className="lg:col-span-2">
                            <h2 className="text-xl font-bold mb-6 text-slate-800">Active Listings ({opportunities.length})</h2>
                            {loading ? (
                                <div className="text-center py-12">Loading...</div>
                            ) : opportunities.length === 0 ? (
                                <div className="p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400">
                                    No opportunities posted yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {opportunities.map(op => (
                                        <div key={op.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-center group hover:shadow-md transition-all">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded border border-slate-200">{op.type}</span>
                                                    <h3 className="font-bold text-slate-800">{op.title}</h3>
                                                </div>
                                                <p className="text-sm text-slate-500">{op.organization} • Deadline: {new Date(op.deadline).toLocaleDateString()}</p>
                                            </div>
                                            <button onClick={() => handleDelete(op.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-lg">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </AdminGuard>
    );
}
