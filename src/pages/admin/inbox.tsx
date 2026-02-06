import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface ContactRequest {
    id: string;
    name: string;
    email: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    createdAt: any;
}

export default function Inbox() {
    const [messages, setMessages] = useState<ContactRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<ContactRequest | null>(null);
    const [replySubject, setReplySubject] = useState('');
    const [replyBody, setReplyBody] = useState('');
    const [sending, setSending] = useState(false);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            // Fetch everything to avoid missing-field filtering with orderBy
            const q = query(collection(db, 'contact_requests'));
            const querySnapshot = await getDocs(q);
            
            const msgs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ContactRequest));
            
            // Sort in memory
            msgs.sort((a, b) => {
                const getMillis = (dateVal: any) => {
                    if (!dateVal) return 0;
                    if (dateVal.seconds) return dateVal.seconds * 1000;
                    if (typeof dateVal.toDate === 'function') return dateVal.toDate().getTime();
                    if (dateVal instanceof Date) return dateVal.getTime();
                    if (typeof dateVal === 'string') return new Date(dateVal).getTime();
                    return 0;
                };
                return getMillis(b.createdAt) - getMillis(a.createdAt);
            });

            console.log("Fetched messages:", msgs);
            setMessages(msgs);
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const formatMessageDate = (msg: ContactRequest) => {
        if (!msg.createdAt) return 'Recent';
        try {
            if (typeof msg.createdAt.toDate === 'function') {
                return msg.createdAt.toDate().toLocaleDateString();
            }
            return new Date(msg.createdAt).toLocaleDateString();
        } catch (e) {
            return 'Recent';
        }
    };

    const handleOpenReply = (msg: ContactRequest) => {
        setReplyingTo(msg);
        setReplySubject(`Re: Contact Request from ${msg.name}`);
        setReplyBody(`Dear ${msg.name.split(' ')[0]},

Thank you for reaching out to us.

`);
        
        // Mark as read if unread
        if (msg.status === 'unread') {
            updateDoc(doc(db, 'contact_requests', msg.id), { status: 'read' });
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
        }
    };

    const handleSendReply = async () => {
        if (!replyingTo || !replySubject || !replyBody) return;
        setSending(true);

        try {
            const user = auth.currentUser;
            const token = await user?.getIdToken();
            const SITE_URL = window.location.origin;

            const contentHtml = `
                <div style="white-space: pre-wrap;">${replyBody}</div>
                <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
                <div style="font-size: 12px; color: #888;">
                    <strong>Original Message:</strong><br/>
                    ${replyingTo.message}
                </div>
            `;

            const res = await fetch('/api/admin/bulk-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    recipients: [{ email: replyingTo.email, name: replyingTo.name }],
                    subject: replySubject,
                    htmlTemplate: contentHtml,
                    useBranding: true,
                    siteUrl: SITE_URL
                })
            });

            if (!res.ok) throw new Error('Failed to send email');

            await updateDoc(doc(db, 'contact_requests', replyingTo.id), { status: 'replied' });
            setMessages(prev => prev.map(m => m.id === replyingTo.id ? { ...m, status: 'replied' } : m));
            
            alert('Reply sent successfully!');
            setReplyingTo(null);
        } catch (error) {
            console.error(error);
            alert('Error sending reply.');
        } finally {
            setSending(false);
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <Navbar />
                
                <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-4xl font-extrabold">Inbox</h1>
                                <span className="bg-featured-blue text-white px-3 py-1 rounded-lg text-sm font-black">
                                    {messages.length}
                                </span>
                            </div>
                            <p className="text-slate-400">Manage incoming contact requests and inquiries.</p>
                        </div>
                        <button 
                            onClick={fetchMessages}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all border border-white/10"
                        >
                            Refresh Inbox
                        </button>
                    </div>
                </section>

                <main className="max-w-7xl mx-auto px-6 py-12">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                            <p className="text-slate-400 font-bold">No messages found in &apos;contact_requests&apos; collection.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`bg-white p-6 rounded-2xl border transition-all ${msg.status === 'unread' ? 'border-l-4 border-l-featured-blue border-y-slate-200 border-r-slate-200 shadow-md' : 'border-slate-200 hover:shadow-sm'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800">{msg.name}</h3>
                                            <p className="text-sm text-slate-500">{msg.email}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-400">
                                                {formatMessageDate(msg)}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                msg.status === 'unread' ? 'bg-blue-100 text-blue-700' : 
                                                msg.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {msg.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">
                                        {msg.message}
                                    </p>
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={() => handleOpenReply(msg)}
                                            className="px-6 py-2 bg-featured-blue text-white rounded-xl font-bold text-sm hover:bg-featured-green transition-colors shadow-sm"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* Reply Modal */}
                {replyingTo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-lg text-slate-800">Reply to {replyingTo.name}</h3>
                                <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-red-500 text-2xl leading-none">&times;</button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Subject</label>
                                    <input 
                                        type="text" 
                                        value={replySubject} 
                                        onChange={(e) => setReplySubject(e.target.value)} 
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-featured-blue outline-none font-bold text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Message</label>
                                    <textarea 
                                        value={replyBody} 
                                        onChange={(e) => setReplyBody(e.target.value)} 
                                        rows={8}
                                        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-featured-blue outline-none resize-none font-medium text-slate-600"
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                                <button 
                                    onClick={() => setReplyingTo(null)} 
                                    className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSendReply} 
                                    disabled={sending}
                                    className="px-8 py-3 rounded-xl bg-featured-blue text-white font-bold hover:bg-featured-green transition-all shadow-lg hover:shadow-featured-green/20 disabled:opacity-70 flex items-center gap-2"
                                >
                                    {sending ? 'Sending...' : 'Send Reply'} <span>✈️</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <Footer />
            </div>
        </AdminGuard>
    );
}
