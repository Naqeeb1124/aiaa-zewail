import { useState } from 'react';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AdminGuard from '../../../components/AdminGuard';
import Navbar from '../../../components/Navbar';
import { useRouter } from 'next/router';

export default function NewEvent() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Combine date and time into a single ISO string
            const dateTime = new Date(`${date}T${time}`);
            
            await addDoc(collection(db, 'events'), {
                title,
                description,
                date: dateTime.toISOString(), 
                time, // Keep the raw time string as well for display if needed
                location,
                imageUrl,
                createdAt: serverTimestamp(),
            });
            router.push('/admin/events');
        } catch (error) {
            console.error("Error creating event:", error);
            alert('Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-900 text-white">
                <Navbar />
                <div className="pt-32 px-6 max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Create New Event</h1>
                    <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-2xl border border-slate-800 space-y-6">
                        <div>
                            <label className="block text-slate-400 mb-2">Event Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                                required
                                placeholder="e.g., Intro to Rocketry Workshop"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-400 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-2">Time</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-2">Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                                required
                                placeholder="e.g., Room 101, Zewail City"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none h-40"
                                required
                                placeholder="Event details..."
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-2">Image URL (Optional)</label>
                            <input
                                type="text"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                                placeholder="https://example.com/event-banner.jpg"
                            />
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                Cancel                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Event'}
                            </button>
                        </div>
                    </form>                </div>            </div>        </AdminGuard>    );}
