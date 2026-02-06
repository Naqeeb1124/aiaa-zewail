import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAdmin } from '../hooks/useAdmin';
import { doc, getDoc, query, collection, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cancelJoinRequest } from '../lib/projects';
import { parseZewailName } from '../lib/auth';

interface RegistrationItem {
    id: string;
    eventId: string;
    userId: string;
    type: 'event';
    eventTitle?: string;
    eventDate?: any;
    [key: string]: any;
}

export default function Dashboard() {
    const { user, loading, isAdmin } = useAdmin();
// ... rest of the component ...

    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');
    const [userProfile, setUserProfile] = useState<any>(null);
    const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
    const [projectRequests, setProjectRequests] = useState<any[]>([]);
    const [downloading, setDownloading] = useState(false);

    // Sync active tab with URL query parameter
    useEffect(() => {
        if (router.query.tab) {
            setActiveTab(router.query.tab as string);
        }
    }, [router.query.tab]);

    const fetchUserData = useCallback(async () => {
        if (user?.uid) {
            try {
                // Fetch profile
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserProfile(docSnap.data());
                }

                // Fetch event registrations
                const q = query(
                    collection(db, 'registrations'),
                    where('userId', '==', user.uid)
                );
                const regSnap = await getDocs(q);
                const regs: RegistrationItem[] = regSnap.docs.map(doc => {
                    const data = doc.data();
                    return { 
                        id: doc.id, 
                        eventId: data.eventId,
                        userId: data.userId,
                        type: 'event',
                        ...data 
                    } as RegistrationItem;
                });
                
                // Fetch event titles for registrations
                const regsWithEvents = await Promise.all(regs.map(async (reg) => {
                    const eventDoc = await getDoc(doc(db, 'events', reg.eventId));
                    return { ...reg, eventTitle: eventDoc.exists() ? eventDoc.data().title : 'Unknown Event', eventDate: eventDoc.exists() ? eventDoc.data().date : null };
                }));
                setRegistrations(regsWithEvents);

                // Fetch project join requests
                const projectQ = query(
                    collection(db, 'joinRequests'),
                    where('userId', '==', user.uid)
                );
                const projectSnap = await getDocs(projectQ);
                const pRequests = projectSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    type: 'project'
                }));
                setProjectRequests(pRequests);

            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleDeleteRegistration = async (regId: string) => {
        if (!confirm('Are you sure you want to cancel this event registration?')) return;
        try {
            await deleteDoc(doc(db, 'registrations', regId));
            setRegistrations(prev => prev.filter(r => r.id !== regId));
            alert('Registration cancelled.');
        } catch (error) {
            console.error("Error deleting registration:", error);
            alert('Failed to cancel registration.');
        }
    };

    const handleCancelProject = async (requestId: string, title: string) => {
        if (!confirm(`Are you sure you want to cancel your application for ${title}?`)) return;
        try {
            await cancelJoinRequest(requestId);
            setProjectRequests(prev => prev.filter(r => r.id !== requestId));
            alert('Project application cancelled.');
            // Refresh profile to update history
            fetchUserData();
        } catch (error: any) {
            console.error("Error cancelling project request:", error);
            alert(`Failed to cancel: ${error.message}`);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">Loading...</div>;

    const formatDate = (dateInput: any) => {
        if (!dateInput) return 'Recent';
        let date;
        // Handle Firestore Timestamp
        if (dateInput && typeof dateInput.toDate === 'function') {
            date = dateInput.toDate();
        } else {
            date = new Date(dateInput);
        }
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Mock member data with real joined date
    const rawName = userProfile?.name || user?.displayName || 'Student Member';
    const member = {
        name: parseZewailName(rawName).fullName || rawName,
        studentId: userProfile?.studentId || '202xxxxx',
        role: isAdmin ? 'Administrator' : 'Active Member',
        joined: user?.metadata?.creationTime 
            ? formatDate(user.metadata.creationTime) 
            : (userProfile?.joinedAt ? formatDate(userProfile.joinedAt) : formatDate(new Date().toISOString())),
        points: userProfile?.points || 0,
        badges: [
            { id: 1, name: 'Rocketry 101', icon: '🚀' },
            { id: 2, name: 'Event Regular', icon: '📅' },
            { id: 3, name: 'Code Contributor', icon: '💻' },
        ],
        projects: [
            { id: 1, name: 'Sounding Rocket Alpha', role: 'Propulsion Lead', status: 'In Progress' },
        ],
    };

    const handleDownloadPortfolio = async () => {
        setDownloading(true);
        try {
            if (!user) {
                alert('You must be logged in to download your portfolio.');
                return;
            }
            const token = await user.getIdToken();

            const response = await fetch('/api/portfolio/generate', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: member.name,
                    email: user?.email,
                    studentId: member.studentId,
                    joined: member.joined,
                    points: member.points,
                    badges: member.badges,
                    projects: member.projects
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `portfolio-${member.name.replace(/\s+/g, '-')}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                alert('Failed to generate portfolio.');
            }
        } catch (error) {
            console.error('Error downloading portfolio:', error);
            alert('Error downloading portfolio');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            
            {/* Hero Section / Header */}
            <section className="pt-32 md:pt-72 pb-8 md:pb-12 bg-featured-blue text-white">
                 <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        <div className="w-20 md:w-24 h-20 md:h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black border-2 border-white/50 shadow-xl uppercase tracking-tighter">
                            {member.name.charAt(0)}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-3xl md:text-4xl font-black mb-2 uppercase tracking-tighter">{member.name}</h1>
                            <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest">{member.role} • Joined {member.joined}</p>
                        </div>
                        {!isAdmin && (
                            <div className="text-center bg-white/10 rounded-[32px] p-6 backdrop-blur-sm border border-white/10 shadow-inner">
                                <div className="text-4xl md:text-5xl font-black text-featured-green leading-none">{member.points}</div>
                                <div className="text-[10px] text-white/60 uppercase tracking-[0.2em] font-black mt-3">Points</div>
                            </div>
                        )}
                    </div>
                 </div>
            </section>

            <main className="max-w-6xl mx-auto px-6 py-12 md:py-12">
                {/* Tabs */}
                <div className="flex gap-8 border-b border-slate-200 mb-8 overflow-x-auto">
                    {['profile', 'projects', 'registrations', 'badges'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-featured-blue' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {tab}
                            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-featured-blue rounded-t-full"></div>}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                    {activeTab === 'profile' && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white p-12 rounded-[40px] shadow-sm border border-slate-100 transition-all hover:shadow-xl group hover:-translate-y-1">
                                <h3 className="text-sm font-black mb-10 text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                    <span className="w-2 h-2 bg-featured-blue rounded-full"></span>
                                    Identity
                                </h3>
                                <div className="space-y-10">
                                    <div>
                                        <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 ml-1">Email Address</label>
                                        <p className="font-black text-xl text-slate-800 uppercase tracking-tight">{user?.email || 'user@example.com'}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 ml-1">Member ID</label>
                                            <p className="font-black text-xl text-slate-800 uppercase tracking-tight">{member.studentId}</p>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3 ml-1">Sector</label>
                                            <p className="font-black text-xl text-slate-800 uppercase tracking-tight">Aerospace</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-12 rounded-[40px] shadow-sm border border-slate-100 flex flex-col justify-center text-center transition-all hover:shadow-xl group hover:-translate-y-1">
                                <div className="w-20 h-24 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner group-hover:bg-featured-blue/5 transition-colors">📄</div>
                                <h3 className="text-2xl font-black mb-3 text-slate-800 uppercase tracking-tighter">Member Portfolio</h3>
                                <p className="text-slate-500 mb-10 max-w-xs mx-auto font-medium">Download your official membership record including all projects and badges.</p>
                                <button 
                                    onClick={handleDownloadPortfolio}
                                    disabled={downloading}
                                    className="w-full py-4 bg-featured-blue hover:bg-featured-green text-white rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-featured-green/20 disabled:opacity-50 transform hover:-translate-y-0.5"
                                >
                                    {downloading ? 'Processing...' : 'Download Document'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'registrations' && (
                        <div className="space-y-8">
                            {/* Events Section */}
                            <div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-featured-blue rounded-full"></span>
                                    Event Registrations
                                </h3>
                                <div className="space-y-4">
                                    {registrations.length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner">
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No activity records found.</p>
                                        </div>
                                    ) : (
                                        registrations.map(reg => (
                                            <div key={reg.id} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2 leading-tight">{reg.eventTitle}</h3>
                                                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">{reg.eventDate ? new Date(reg.eventDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date TBD'}</p>
                                                </div>
                                                <div className="flex items-center gap-6 w-full sm:w-auto">
                                                    <span className="px-5 py-2 rounded-full bg-featured-green/10 text-featured-green text-[10px] font-black uppercase tracking-[0.2em] border border-featured-green/20">Authorized</span>
                                                    <div className="flex gap-3 ml-auto sm:ml-0">
                                                        <Link href={`/events/${reg.eventId}`} legacyBehavior>
                                                            <a className="p-4 text-slate-400 hover:text-featured-blue transition-all bg-slate-50 hover:bg-featured-blue/5 rounded-full shadow-inner">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                            </a>
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleDeleteRegistration(reg.id)}
                                                            className="p-4 text-slate-400 hover:text-red-500 transition-all bg-slate-50 hover:bg-red-50 rounded-full shadow-inner"
                                                            title="Cancel Registration"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Projects Section */}
                            <div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-featured-green rounded-full"></span>
                                    Project Applications
                                </h3>
                                <div className="space-y-4">
                                    {projectRequests.length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner">
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No application history found.</p>
                                        </div>
                                    ) : (
                                        projectRequests.map(req => (
                                            <div key={req.id} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 group">
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2 leading-tight">{req.projectTitle}</h3>
                                                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                                        {req.projectType} • {req.semester}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-6 w-full sm:w-auto">
                                                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                                                        req.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        req.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                        'bg-amber-100 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {req.status === 'accepted' ? 'Enrolled' : req.status}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleCancelProject(req.id, req.projectTitle)}
                                                        className="p-4 ml-auto sm:ml-0 text-slate-400 hover:text-red-500 transition-all bg-slate-50 hover:bg-red-50 rounded-full shadow-inner"
                                                        title="Cancel Application"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="space-y-4">
                            {member.projects.map(proj => (
                                <div key={proj.id} className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-1">{proj.name}</h3>
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{proj.role}</p>
                                    </div>
                                    <span className="px-4 py-1.5 rounded-full bg-featured-green/10 text-featured-green text-[10px] font-black uppercase tracking-widest border border-featured-green/20">{proj.status}</span>
                                </div>
                            ))}
                            <button className="w-full py-8 border-2 border-dashed border-slate-200 text-slate-400 rounded-[32px] hover:border-featured-blue hover:text-featured-blue hover:bg-featured-blue/5 transition-all font-black uppercase tracking-[0.2em] text-xs">
                                + Join a new project
                            </button>
                        </div>
                    )}

                    {activeTab === 'badges' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {member.badges.map(badge => (
                                <div key={badge.id} className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 text-center group hover:border-featured-green hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-500">{badge.icon}</div>
                                    <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">{badge.name}</h3>
                                </div>
                            ))}
                            {/* Locked badge placeholder */}
                            <div className="bg-slate-50 p-10 rounded-[32px] border border-dashed border-slate-200 text-center opacity-60">
                                <div className="text-5xl mb-6 grayscale opacity-30">🏆</div>
                                <h3 className="font-black text-slate-400 uppercase tracking-tight text-sm">Leadership</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3">Locked</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}