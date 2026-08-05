import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import Navbar from '../../components/Navbar';

type FormType = 'announcement' | 'event';

export default function CreateItem() {
    const router = useRouter();
    const { type: queryType } = router.query as { type?: string };
    const [type, setType] = useState<FormType>('announcement');
    const [loading, setLoading] = useState(false);

    // Sync URL query with internal state
    useEffect(() => {
        if (queryType === 'event' || queryType === 'announcement') {
            setType(queryType as FormType);
        }
    }, [queryType]);

    // Common fields
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    // Announcement specific
    const [content, setContent] = useState('');

    // Event specific
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (type === 'announcement') {
                await addDoc(collection(db, 'announcements'), {
                    title,
                    content,
                    imageUrl,
                    createdAt: serverTimestamp(),
                });
                router.push('/admin');
            } else {
                const dateTime = new Date(`${date}T${time}`);
                await addDoc(collection(db, 'events'), {
                    title,
                    description,
                    date: dateTime.toISOString(),
                    location,
                    imageUrl,
                    createdAt: serverTimestamp(),
                });
                router.push('/admin');
            }
        } catch (error) {
            console.error('Error creating item:', error);
            alert('Failed to create item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-ink text-white font-sans">
                <Navbar />
                <div className="pt-32 px-6 max-w-3xl mx-auto">
                    <h1 className="text-3xl font-black mb-8 uppercase tracking-tight">
                        {type === 'announcement' ? 'Post New Announcement' : 'Create New Event'}
                    </h1>
                    
                    {/* Type switch */}
                    <div className="mb-10 flex space-x-4">
                        <button
                            type="button"
                            onClick={() => setType('announcement')}
                            className={`px-6 py-2 font-black uppercase tracking-widest text-xs transition-all ${type === 'announcement' ? 'bg-white text-ink' : 'bg-ink text-ink-muted hover:text-white'} `}
                        >
                            Announcement
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('event')}
                            className={`px-6 py-2 font-black uppercase tracking-widest text-xs transition-all ${type === 'event' ? 'bg-white text-ink' : 'bg-ink text-ink-muted hover:text-white'} `}
                        >
                            Event
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-ink p-8 md:p-12 border border-ink space-y-8">
                        {/* Title */}
                        <div>
                            <label className="block text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mb-3 ml-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-ink border border-ink px-6 py-4 text-white focus:border-deep outline-none font-bold transition-all"
                                required
                                placeholder="Enter mission title"
                            />
                        </div>

                        {/* Conditional fields */}
                        {type === 'announcement' && (
                            <>
                                <div>
                                    <label className="block text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mb-3 ml-1">Content</label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full bg-ink border border-ink px-6 py-4 text-white focus:border-deep outline-none h-40 font-medium resize-none transition-all"
                                        required
                                        placeholder="Write your update..."
                                    />
                                </div>
                            </>
                        )}

                        {type === 'event' && (
                            <>
                                <div>
                                    <label className="block text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mb-3 ml-1">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-ink border border-ink px-6 py-4 text-white focus:border-deep outline-none h-40 font-medium resize-none transition-all"
                                        required
                                        placeholder="Mission details..."
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mb-3 ml-1">Date</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-ink border border-ink px-6 py-4 text-white focus:border-deep outline-none font-bold transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mb-3 ml-1">Time</label>
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full bg-ink border border-ink px-6 py-4 text-white focus:border-deep outline-none font-bold transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mb-3 ml-1">Location</label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-ink border border-ink px-6 py-4 text-white focus:border-deep outline-none font-bold transition-all"
                                        required
                                        placeholder="e.g., Room 101, Zewail City"
                                    />
                                </div>
                            </>
                        )}

                        {/* Image URL (optional) */}
                        <div>
                            <label className="block text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mb-3 ml-1">Image URL (Optional)</label>
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full bg-ink border border-ink px-6 py-4 text-white focus:border-deep outline-none font-bold transition-all"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-10 py-4 text-ink-muted font-black uppercase tracking-widest text-xs hover:text-white transition-all order-2 sm:order-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-12 py-4 bg-white text-ink font-black uppercase tracking-widest text-xs hover:bg-deep hover:text-white transition-all transform hover:-translate-y-0.5 disabled:opacity-50 order-1 sm:order-2"
                            >
                                {loading ? 'Processing...' : (type === 'announcement' ? 'Post Bulletin' : 'Launch Event')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminGuard>
    );
}
