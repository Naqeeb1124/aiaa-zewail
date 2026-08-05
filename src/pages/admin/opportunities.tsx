import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';

export default function ManageOpportunities() {
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
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
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                isArchived: false,
                createdAt: serverTimestamp()
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
            setOpportunities(prev => prev.filter(op => op.id !== id));
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        } catch (error) {
            alert('Error deleting opportunity.');
        }
    };

    const handleToggleArchive = async (opportunity: any) => {
        const newArchivedState = !opportunity.isArchived;
        if (!confirm(`${newArchivedState ? 'Archive' : 'Restore'} this opportunity?`)) return;
        try {
            await updateDoc(doc(db, 'opportunities', opportunity.id), {
                isArchived: newArchivedState,
                updatedAt: serverTimestamp()
            });
            setOpportunities(prev => prev.map(item => item.id === opportunity.id
                ? { ...item, isArchived: newArchivedState }
                : item
            ));
            setSelectedIds(prev => prev.filter(id => id !== opportunity.id));
        } catch (error) {
            alert('Error updating opportunity archive state.');
        }
    };

    const filteredOpportunities = opportunities.filter(op => !!op.isArchived === showArchived);
    const visibleOpportunityIds = filteredOpportunities.map(opportunity => opportunity.id);
    const selectedVisibleCount = selectedIds.filter(id => visibleOpportunityIds.includes(id)).length;
    const allVisibleSelected = filteredOpportunities.length > 0 && selectedVisibleCount === filteredOpportunities.length;

    const handleSelectAll = () => {
        setSelectedIds(prev => allVisibleSelected
            ? prev.filter(id => !visibleOpportunityIds.includes(id))
            : Array.from(new Set([...prev, ...visibleOpportunityIds]))
        );
    };

    const handleBulkArchive = async (newArchivedState: boolean, ids = selectedIds.filter(id => visibleOpportunityIds.includes(id))) => {
        const idsToUpdate = ids.filter(id => visibleOpportunityIds.includes(id));
        if (idsToUpdate.length === 0) return;
        if (!confirm(`${newArchivedState ? 'Archive' : 'Restore'} ${idsToUpdate.length} selected opportunit${idsToUpdate.length === 1 ? 'y' : 'ies'}?`)) return;

        try {
            for (let index = 0; index < idsToUpdate.length; index += 450) {
                const batch = writeBatch(db);
                idsToUpdate.slice(index, index + 450).forEach(id => batch.update(doc(db, 'opportunities', id), {
                    isArchived: newArchivedState,
                    updatedAt: serverTimestamp()
                }));
                await batch.commit();
            }
            setOpportunities(prev => prev.map(opportunity => idsToUpdate.includes(opportunity.id)
                ? { ...opportunity, isArchived: newArchivedState }
                : opportunity
            ));
            setSelectedIds(prev => prev.filter(id => !idsToUpdate.includes(id)));
        } catch (error) {
            console.error('Error updating opportunity archive state:', error);
            alert('Error updating selected opportunities.');
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-canvas font-sans text-ink">
                <Navbar />
                
                <section className="pt-72 pb-12 bg-ink text-white border-b border-ink">
                    <div className="max-w-7xl mx-auto px-6">
                        <h1 className="text-4xl font-extrabold mb-2">Career Hub Manager</h1>
                        <p className="text-ink-muted">Add and manage internships, scholarships, and competitions.</p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 border border-line sticky top-32">
                                <h2 className="text-xl font-bold mb-6 text-ink">Post New Opportunity</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Title</label>
                                        <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 border border-line focus:ring-2 focus:ring-deep outline-none" placeholder="e.g. Summer Internship" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Organization</label>
                                        <input required type="text" name="organization" value={formData.organization} onChange={handleInputChange} className="w-full p-3 border border-line focus:ring-2 focus:ring-deep outline-none" placeholder="e.g. NASA, SpaceX" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Type</label>
                                            <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-3 border border-line focus:ring-2 focus:ring-deep outline-none">
                                                <option value="internship">Internship</option>
                                                <option value="scholarship">Scholarship</option>
                                                <option value="competition">Competition</option>
                                                <option value="research">Research</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Deadline</label>
                                            <input required type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full p-3 border border-line focus:ring-2 focus:ring-deep outline-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Location</label>
                                        <input required type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full p-3 border border-line focus:ring-2 focus:ring-deep outline-none" placeholder="e.g. Remote, Cairo, USA" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Application Link</label>
                                        <input required type="url" name="link" value={formData.link} onChange={handleInputChange} className="w-full p-3 border border-line focus:ring-2 focus:ring-deep outline-none" placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Tags (comma separated)</label>
                                        <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className="w-full p-3 border border-line focus:ring-2 focus:ring-deep outline-none" placeholder="Space, Engineering, Fully Funded" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-ink-soft mb-1">Brief Description</label>
                                        <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full p-3 border border-line focus:ring-2 focus:ring-deep outline-none" placeholder="Short summary..." />
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-deep text-white font-bold hover:bg-growth transition-colors disabled:opacity-50">
                                        {isSubmitting ? 'Posting...' : 'Post Opportunity'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* List */}
                        <div className="lg:col-span-2">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-ink">{showArchived ? 'Archived Opportunities' : 'Active Listings'} ({filteredOpportunities.length})</h2>
                                    {filteredOpportunities.length > 0 && (
                                        <label className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink-muted cursor-pointer w-fit">
                                            <input type="checkbox" checked={allVisibleSelected} onChange={handleSelectAll} className="w-4 h-4 text-deep border-ink-muted focus:ring-deep" />
                                            Select all visible
                                        </label>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {!showArchived && filteredOpportunities.length > 0 && (
                                        <button onClick={() => handleBulkArchive(true, visibleOpportunityIds)} className="px-4 py-2 bg-ember text-white text-xs font-bold uppercase tracking-widest hover:bg-deep transition-all">
                                            Archive all
                                        </button>
                                    )}
                                    {selectedVisibleCount > 0 && (
                                        <button onClick={() => handleBulkArchive(!showArchived)} className="px-4 py-2 bg-ember text-white text-xs font-bold uppercase tracking-widest hover:bg-deep transition-all">
                                            {showArchived ? 'Restore' : 'Archive'} {selectedVisibleCount}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setShowArchived(!showArchived);
                                            setSelectedIds([]);
                                        }}
                                        className="px-4 py-2 bg-white border border-line text-xs font-bold uppercase tracking-widest text-ink-soft hover:text-deep hover:border-deep transition-all"
                                    >
                                        {showArchived ? 'Show Active' : 'Show Archived'}
                                    </button>
                                </div>
                            </div>
                            {loading ? (
                                <div className="text-center py-12">Loading...</div>
                            ) : filteredOpportunities.length === 0 ? (
                                <div className="p-12 bg-white border border-dashed border-line text-center text-ink-muted">
                                    No {showArchived ? 'archived opportunities' : 'opportunities posted yet'}.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredOpportunities.map(op => (
                                        <div key={op.id} className={`bg-white p-6 border ${selectedIds.includes(op.id) ? 'border-deep ring-2 ring-deep/10' : 'border-line'} flex justify-between items-center group transition-all`}>
                                            <div className="flex items-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(op.id)}
                                                    onChange={() => setSelectedIds(prev => prev.includes(op.id) ? prev.filter(id => id !== op.id) : [...prev, op.id])}
                                                    aria-label={`Select ${op.title}`}
                                                    className="mt-1 w-4 h-4 text-deep border-ink-muted focus:ring-deep"
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="px-2 py-0.5 bg-line text-ink-soft text-[10px] font-bold uppercase border border-line">{op.type}</span>
                                                        {op.isArchived && <span className="px-2 py-0.5 bg-accent-orange-soft text-ember text-[10px] font-bold uppercase border border-accent-orange-soft">Archived</span>}
                                                        <h3 className="font-bold text-ink">{op.title}</h3>
                                                    </div>
                                                    <p className="text-sm text-ink-soft">{op.organization} • Deadline: {new Date(op.deadline).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleToggleArchive(op)} className="p-2 text-ink-muted hover:text-ember transition-colors bg-canvas border border-line" title={op.isArchived ? 'Restore' : 'Archive'}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(op.id)} className="p-2 text-ink-muted hover:text-ember transition-colors bg-canvas">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 01-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
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
