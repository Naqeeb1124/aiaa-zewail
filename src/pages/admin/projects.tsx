import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { getCurrentSemester } from '../../lib/projects'
import { ProjectType } from '../../types/project'
import AdminGuard from '../../components/AdminGuard'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ImageUpload from '../../components/ImageUpload'

export default function ManageProjects() {
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showArchived, setShowArchived] = useState(false)

    // Form State
    const initialForm = {
        title: '',
        category: 'Research',
        type: 'Non-flagship' as ProjectType,
        semester: getCurrentSemester(),
        maxSeats: 10,
        currentSeats: 0,
        description: '',
        status: 'Planning',
        icon: '🚀',
        coverImage: '',
        isArchived: false,
        progress: 0
    }
    const [formData, setFormData] = useState(initialForm)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
            const querySnapshot = await getDocs(q)
            const projList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setProjects(projList)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching projects:", error)
            setLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'progress' ? parseInt(value) : value)
        setFormData(prev => ({
            ...prev,
            [name]: val
        }))
    }

    const handleEdit = (proj: any) => {
        setEditingId(proj.id)
        setFormData({
            title: proj.title || '',
            category: proj.category || 'Research',
            type: proj.type || 'Non-flagship',
            semester: proj.semester || getCurrentSemester(),
            maxSeats: proj.maxSeats || 10,
            currentSeats: proj.currentSeats || 0,
            description: proj.description || '',
            status: proj.status || 'Planning',
            icon: proj.icon || '🚀',
            coverImage: proj.coverImage || '',
            isArchived: proj.isArchived || false,
            progress: proj.progress || 0
        })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setFormData(initialForm)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editingId) {
                // Update
                const projectRef = doc(db, 'projects', editingId)
                await updateDoc(projectRef, {
                    ...formData,
                    updatedAt: serverTimestamp()
                })
            } else {
                // Create
                await addDoc(collection(db, 'projects'), {
                    ...formData,
                    createdAt: serverTimestamp()
                })
            }
            setEditingId(null)
            setFormData(initialForm)
            fetchProjects()
            alert(editingId ? "Project updated." : "Project created.")
        } catch (error) {
            console.error("Error saving project:", error)
            alert("Failed to save project.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this project?")) return;
        try {
            await deleteDoc(doc(db, 'projects', id))
            setProjects(projects.filter(p => p.id !== id))
        } catch (error) {
            alert("Error deleting project")
        }
    }

    const handleToggleArchive = async (proj: any) => {
        const newArchivedState = !proj.isArchived;
        if (!confirm(`${newArchivedState ? 'Archive' : 'Restore'} this project?`)) return;
        try {
            const projectRef = doc(db, 'projects', proj.id)
            await updateDoc(projectRef, {
                isArchived: newArchivedState,
                updatedAt: serverTimestamp()
            })
            fetchProjects()
        } catch (error) {
            alert("Error updating archive state")
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Recruiting': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    }

    const filteredProjects = projects.filter(p => !!p.isArchived === showArchived);

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <Navbar />

                <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-6">
                        <h1 className="text-4xl font-extrabold mb-2">Mission Control</h1>
                        <p className="text-slate-400">Oversee technical projects and research initiatives.</p>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-32">
                                <h2 className="text-xl font-bold mb-6 text-slate-800">{editingId ? 'Edit Project' : 'Launch New Project'}</h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Project Name</label>
                                        <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="e.g. Mars Rover" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status</label>
                                            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none">
                                                <option>Planning</option>
                                                <option>Recruiting</option>
                                                <option>In Progress</option>
                                                <option>Completed</option>
                                                <option>On Hold</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Emoji Icon</label>
                                            <input type="text" name="icon" value={formData.icon} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none text-center" placeholder="🚀" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
                                        <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none">
                                            <option>Research</option>
                                            <option>Competition</option>
                                            <option>Software</option>
                                            <option>Outreach</option>
                                            <option>Flagship</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Type</label>
                                            <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none">
                                                <option value="Non-flagship">Non-flagship</option>
                                                <option value="Flagship">Flagship</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Semester</label>
                                            <input type="text" name="semester" value={formData.semester} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" placeholder="e.g. Spring 2024" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Max Seats</label>
                                            <input type="number" name="maxSeats" value={formData.maxSeats} onChange={handleInputChange} min="1" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Current Seats</label>
                                            <input type="number" disabled value={formData.currentSeats} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 outline-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Progress ({formData.progress}%)</label>
                                        <input type="range" name="progress" min="0" max="100" value={formData.progress} onChange={handleInputChange} className="w-full accent-featured-blue h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cover Image</label>
                                        <ImageUpload 
                                            initialImageUrl={formData.coverImage} 
                                            onUploadSuccess={(url) => setFormData(prev => ({ ...prev, coverImage: url }))} 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                                            Description <span className="text-[10px] font-medium lowercase text-slate-400">(Supports HTML for styling)</span>
                                        </label>
                                        <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-featured-blue outline-none font-mono text-sm" placeholder="<b>Project</b> goals..." />
                                    </div>

                                    <div className="flex items-center gap-2 py-2">
                                        <input 
                                            type="checkbox" 
                                            name="isArchived" 
                                            id="isArchived"
                                            checked={formData.isArchived} 
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-featured-blue rounded border-slate-300 focus:ring-featured-blue"
                                        />
                                        <label htmlFor="isArchived" className="text-xs font-bold text-slate-600 uppercase tracking-wide cursor-pointer">Archive Project</label>
                                    </div>

                                    <div className="flex gap-2">
                                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-featured-blue text-white font-bold rounded-xl hover:bg-featured-green transition-colors disabled:opacity-50">
                                            {editingId ? 'Update' : 'Create'}
                                        </button>
                                        {editingId && (
                                            <button type="button" onClick={handleCancelEdit} className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">{showArchived ? 'Archived Projects' : 'Active Initiatives'} ({filteredProjects.length})</h2>
                                <button 
                                    onClick={() => setShowArchived(!showArchived)}
                                    className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-featured-blue hover:border-featured-blue transition-all shadow-sm"
                                >
                                    {showArchived ? 'Show Active' : 'Show Archived'}
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-12 text-slate-500">Loading projects...</div>
                            ) : filteredProjects.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                                    <p className="text-slate-400">No {showArchived ? 'archived' : 'active'} projects.</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {filteredProjects.map((proj) => (
                                        <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 flex flex-col hover:shadow-lg transition-all group overflow-hidden">
                                            {proj.coverImage ? (
                                                <div className="h-48 overflow-hidden relative">
                                                    <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    {proj.isArchived && (
                                                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                                            <span className="bg-white text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Archived</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-48 bg-slate-50 flex items-center justify-center text-5xl relative">
                                                    {proj.icon || '🚀'}
                                                    {proj.isArchived && (
                                                        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center">
                                                            <span className="bg-white text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">Archived</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="p-6 flex flex-col flex-grow">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100">
                                                        {proj.icon || '🚀'}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleToggleArchive(proj)} className="text-slate-400 hover:text-amber-500 p-1" title={proj.isArchived ? "Restore" : "Archive"}>
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                                        </button>
                                                        <button onClick={() => handleEdit(proj)} className="text-slate-400 hover:text-featured-blue p-1">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button onClick={() => handleDelete(proj.id)} className="text-slate-400 hover:text-red-500 p-1">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-800 mb-1">{proj.title}</h3>
                                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(proj.status)}`}>
                                                        {proj.status}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-50 rounded border border-slate-100">
                                                        {proj.category}
                                                    </span>
                                                    {proj.type === 'Flagship' && (
                                                        <span className="text-[10px] font-bold uppercase text-white bg-featured-blue px-2 py-0.5 rounded">
                                                            Flagship
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-grow">{proj.description.replace(/<[^>]*>?/gm, '')}</p>

                                                {!proj.isArchived && (
                                                    <div>
                                                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 uppercase">
                                                            <span>Progress</span>
                                                            <span>{proj.progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                            <div className="bg-featured-blue h-2 rounded-full transition-all duration-500" style={{ width: `${proj.progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}
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
    )
}
