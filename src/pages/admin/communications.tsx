import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import AdminGuard from '../../components/AdminGuard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Papa from 'papaparse';
import { getBrandedTemplate } from '../../lib/emailTemplates';

type Audience = 'official' | 'all' | 'events' | 'custom' | 'single';

export default function CommunicationsHub() {
    const [audience, setAudience] = useState<Audience>('official');
    const [singleRecipient, setSingleRecipient] = useState('');
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<string>('');
    const [eventTarget, setEventTarget] = useState<'all' | 'attended'>('all');
    const [customRecipients, setCustomRecipients] = useState<{ name: string, email: string }[]>([]);
    const [csvFileName, setCsvFileName] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [useBranding, setUseBranding] = useState(true);
    const [sending, setSending] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [result, setResult] = useState<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const SITE_URL = 'https://aiaa-zewail.vercel.app'; 

    useEffect(() => {
        const fetchEvents = async () => {
            const q = query(collection(db, 'events'));
            const snap = await getDocs(q);
            setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        fetchEvents();
    }, []);

    const insertTag = (tag: string, closeTag: string = '') => {
        if (!textareaRef.current) return;
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = textareaRef.current.value;
        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + tag + selected + (closeTag || tag) + after;
        setMessage(newText);
        
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + tag.length, start + tag.length + selected.length);
            }
        }, 0);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCsvFileName(file.name);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsed = results.data.map((row: any) => {
                    const keys = Object.keys(row);
                    const emailKey = keys.find(k => k.toLowerCase().includes('email')) || keys[0];
                    const nameKey = keys.find(k => k.toLowerCase().includes('name')) || keys[1];
                    return {
                        name: row[nameKey] || '',
                        email: row[emailKey] || ''
                    };
                }).filter(r => r.email && r.email.includes('@'));
                setCustomRecipients(parsed);
            }
        });
    };

    const fetchRecipients = async () => {
        if (audience === 'single') {
            if (!singleRecipient || !singleRecipient.includes('@')) return [];
            return [{ name: '', email: singleRecipient, firstName: '' }];
        }
        if (audience === 'custom') return customRecipients.map(r => ({ ...r, firstName: r.name ? r.name.split(' ')[0] : '' }));
        let recipients: { name: string, email: string, firstName?: string }[] = [];
        if (audience === 'official') {
            const snap = await getDocs(collection(db, 'members'));
            recipients = snap.docs.map(d => ({
                name: d.data().name, 
                email: d.data().email,
                firstName: d.data().firstName || d.data().name?.split(' ')[0] || ''
            }));
        } else if (audience === 'all') {
            const snap = await getDocs(collection(db, 'users'));
            recipients = snap.docs.map(d => ({
                name: d.data().name, 
                email: d.data().email,
                firstName: d.data().firstName || d.data().name?.split(' ')[0] || ''
            }));
        } else if (audience === 'events' && selectedEvent) {
            let q = query(collection(db, 'registrations'), where('eventId', '==', selectedEvent));
            if (eventTarget === 'attended') q = query(q, where('status', '==', 'attended'));
            const snap = await getDocs(q);
            recipients = snap.docs.map(d => ({
                name: d.data().userName || 'Attendee',
                email: d.data().userEmail,
                firstName: d.data().userName?.split(' ')[0] || ''
            })).filter(r => r.email);
        }
        return recipients;
    };

    const handleSend = async () => {
        if (!subject || !message) return alert('Please fill in subject and message.');
        setSending(true);
        setResult(null);
        
        try {
            const recipients = await fetchRecipients();
            if (recipients.length === 0) {
                alert('No recipients found.');
                setSending(false);
                return;
            }
            
            setProgress({ current: 0, total: recipients.length });
            const user = auth.currentUser;
            const token = await user?.getIdToken();

            let contentHtml = message.replace(/\n/g, '<br/>');
            
            const res = await fetch('/api/admin/bulk-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    recipients, 
                    subject, 
                    htmlTemplate: contentHtml, 
                    useBranding,
                    siteUrl: SITE_URL
                })
            });

            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error(error);
            alert('Failed to send.');
        } finally {
            setSending(false);
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <section className="pt-72 pb-12 bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]"></div>
                    <div className="max-w-5xl mx-auto px-6 relative z-10">
                        <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-tighter leading-none">Dispatch Center</h1>
                        <p className="text-slate-400 font-medium">Create and broadcast personalized AIAA updates.</p>
                    </div>
                </section>

                <main className="max-w-5xl mx-auto px-6 py-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                                <h2 className="font-black text-slate-800 mb-6 uppercase tracking-tight text-xs flex items-center gap-2">
                                    <span className="w-2 h-2 bg-featured-blue rounded-full"></span>
                                    1. Target Audience
                                </h2>
                                <div className="space-y-2">
                                    {[ 
                                        { id: 'official', label: 'Official Members', sub: 'Approved directory' },
                                        { id: 'all', label: 'All Accounts', sub: 'Sign-in history' },
                                        { id: 'events', label: 'Event Group', sub: 'Based on attendance' },
                                        { id: 'custom', label: 'Custom CSV', sub: 'Manual upload' },
                                        { id: 'single', label: 'Single Recipient', sub: 'Direct message' }
                                    ].map(opt => (
                                        <button 
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setAudience(opt.id as Audience)}
                                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${audience === opt.id ? 'border-featured-blue bg-blue-50/50 text-featured-blue' : 'border-slate-50 hover:border-slate-100 hover:bg-slate-50/50'}`}
                                        >
                                            <p className="font-black text-xs uppercase tracking-tight">{opt.label}</p>
                                            <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest mt-1">{opt.sub}</p>
                                        </button>
                                    ))}
                                </div>

                                {audience === 'single' && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <input 
                                            type="email" 
                                            value={singleRecipient}
                                            onChange={(e) => setSingleRecipient(e.target.value)}
                                            placeholder="recipient@example.com"
                                            className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white focus:ring-2 focus:ring-featured-blue"
                                        />
                                    </div>
                                )}

                                {audience === 'events' && (
                                    <div className="mt-4 space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <select 
                                            value={selectedEvent}
                                            onChange={(e) => setSelectedEvent(e.target.value)}
                                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white"
                                        >
                                            <option value="">Select Event...</option>
                                            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                                        </select>
                                        <div className="flex gap-1 p-1 bg-white rounded-lg border border-slate-200 shadow-sm">
                                            <button type="button" onClick={() => setEventTarget('all')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-md transition-all ${eventTarget === 'all' ? 'bg-featured-blue text-white shadow-sm' : 'text-slate-400'}`}>All</button>
                                            <button type="button" onClick={() => setEventTarget('attended')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-md transition-all ${eventTarget === 'attended' ? 'bg-featured-blue text-white shadow-sm' : 'text-slate-400'}`}>Attended</button>
                                        </div>
                                    </div>
                                )}

                                {audience === 'custom' && (
                                    <div className="mt-4">
                                        <label className="block w-full cursor-pointer group">
                                            <div className="py-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center group-hover:border-featured-blue group-hover:bg-slate-50 transition-all">
                                                <span className="text-xl mb-1">📄</span>
                                                <span className="text-[9px] font-black uppercase text-slate-400">{csvFileName || 'Upload CSV'}</span>
                                            </div>
                                            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                                <h2 className="font-black text-slate-800 mb-6 uppercase tracking-tight text-xs flex items-center gap-2">
                                    <span className="w-2 h-2 bg-featured-blue rounded-full"></span>
                                    2. Personalize
                                </h2>
                                <div className="grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => insertTag('{{name}}')} className="p-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 hover:border-featured-blue hover:text-featured-blue transition-all">{"{{name}}"}</button>
                                    <button type="button" onClick={() => insertTag('{{email}}')} className="p-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-100 hover:border-featured-blue hover:text-featured-blue transition-all">{"{{email}}"}</button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-8 md:p-10 rounded-[40px] border border-slate-200 shadow-sm">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                                    <h2 className="font-black text-slate-800 uppercase tracking-tight text-xl">Message Draft</h2>
                                    <button 
                                        type="button"
                                        onClick={() => setUseBranding(!useBranding)}
                                        className={`flex items-center gap-3 px-5 py-2.5 rounded-full transition-all border-2 ${useBranding ? 'bg-featured-blue border-featured-blue text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'}`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{useBranding ? 'Master Template On' : 'Plain Mode'}</span>
                                        <div className={`w-2 h-2 rounded-full ${useBranding ? 'bg-featured-green animate-pulse' : 'bg-slate-300'}`} />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="EMAIL SUBJECT HEADER"
                                            className="w-full px-8 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-featured-blue/5 focus:border-featured-blue transition-all outline-none font-black text-xl uppercase tracking-tight text-featured-blue"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex flex-wrap gap-1 mb-4 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
                                            <button type="button" title="Bold" onClick={() => insertTag('<b>', '</b>')} className="w-10 h-10 flex items-center justify-center font-black text-slate-600 hover:bg-white hover:text-featured-blue rounded-xl transition-all">B</button>
                                            <button type="button" title="Italic" onClick={() => insertTag('<i>', '</i>')} className="w-10 h-10 flex items-center justify-center italic font-serif text-slate-600 hover:bg-white hover:text-featured-blue rounded-xl transition-all">I</button>
                                            <button type="button" title="Link" onClick={() => insertTag('<a href="#" style="color: #00a7e1; font-weight: bold; text-decoration: underline;">', '</a>')} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white hover:text-featured-blue rounded-xl transition-all text-lg">🔗</button>
                                            <div className="w-px h-6 bg-slate-200 mx-1 self-center"></div>
                                            <button type="button" title="Highlight Box" onClick={() => insertTag(`<div style="background: #f7f9fc; padding: 24px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0;">
  <h3 style="margin-top: 0; color: #2b4b77;">Title</h3>
  `, `
</div>`)} className="px-4 h-10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:text-featured-blue rounded-xl transition-all">Box</button>
                                            <button type="button" title="New Line" onClick={() => insertTag('<br/>')} className="px-4 h-10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white hover:text-featured-blue rounded-xl transition-all">Break</button>
                                        </div>
                                        <textarea 
                                            ref={textareaRef}
                                            rows={14}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Write your personal message here. HTML is supported. Use tags like {{name}} for personalization."
                                            className="w-full px-8 py-8 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-featured-blue/5 focus:border-featured-blue transition-all outline-none font-medium resize-none text-lg leading-relaxed text-slate-700 shadow-inner"
                                        />
                                    </div>

                                    {sending ? (
                                        <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 shadow-inner">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">Engaging Thrusters...</span>
                                                <span className="text-sm font-black text-blue-700">{progress.current} / {progress.total}</span>
                                            </div>
                                            <div className="w-full h-3 bg-blue-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-featured-blue transition-all duration-500" style={{ width: `${(progress.current / progress.total) * 100}%` }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={handleSend}
                                            className="w-full py-6 rounded-full bg-featured-blue text-white font-black uppercase tracking-[0.3em] text-sm hover:bg-featured-green transition-all shadow-2xl hover:shadow-featured-green/30 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4"
                                        >
                                            🚀 SEND DISPATCH
                                        </button>
                                    )}

                                    {result && (
                                        <div className={`p-6 rounded-3xl border-2 ${result.failed === 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'} animate-in fade-in slide-in-from-bottom duration-500 shadow-sm`}>
                                            <p className="font-black uppercase text-[10px] tracking-widest mb-1">Transmission Report</p>
                                            <p className="text-sm font-bold opacity-80">Success: {result.success} | Failures: {result.failed}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </AdminGuard>
    );
}