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

    if (loading) return <div className="min-h-screen paper-surface flex items-center justify-center text-ink">Loading your stuff...</div>;

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
        role: isAdmin ? 'Board member' : 'Active member',
        joined: user?.metadata?.creationTime
            ? formatDate(user.metadata.creationTime)
            : (userProfile?.joinedAt ? formatDate(userProfile.joinedAt) : formatDate(new Date().toISOString())),
        points: userProfile?.points || 0,
        badges: [
            { id: 1, name: 'First build', emoji: '🛠' },
            { id: 2, name: 'Showed up often', emoji: '🔁' },
            { id: 3, name: 'Wrote the code', emoji: '⌨' },
        ],
        projects: [
            { id: 1, name: 'Flight test · Alpha', role: 'Propulsion lead', status: 'In Progress' },
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
        <div className="min-h-screen paper-surface text-ink">
            <Navbar />
            
            {/* Header band */}
            <section className="relative bg-deep text-white topo-wash overflow-hidden pt-32 md:pt-40 pb-10 md:pb-12">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        <div className="w-20 md:w-24 h-20 md:h-24 bg-white/15 flex items-center justify-center text-3xl font-display font-semibold border border-white/30">
                            {member.name.charAt(0)}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <span className="eyebrow text-spark">Your dashboard</span>
                            <h1 className="mt-2 font-display text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-tight">
                                Hi, {member.name.split(' ')[0]}.
                            </h1>
                            <p className="text-white/70 text-[13px] mt-1">
                                {member.role} · joined {member.joined}
                            </p>
                        </div>
                        {!isAdmin && (
                            <div className="px-6 py-4 bg-white/10 border border-white/15 text-center">
                                <div className="font-display text-3xl md:text-4xl font-semibold text-spark leading-none">
                                    {member.points}
                                </div>
                                <div className="eyebrow text-white/70 mt-2">Show-up points</div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-6 py-10 md:py-14">
                {/* Tabs */}
                <div className="flex gap-7 border-b border-line mb-10 overflow-x-auto">
                    {[
                        { id: 'profile', label: 'Profile' },
                        { id: 'projects', label: 'Projects' },
                        { id: 'registrations', label: 'Events I joined' },
                        { id: 'badges', label: 'Badges' },
                    ].map(tab => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 text-[13px] eyebrow relative whitespace-nowrap duration-base ease-human ${
                                    active ? 'text-ink' : 'text-ink-muted hover:text-ink-soft'
                                }`}
                            >
                                {tab.label}
                                {active && (
                                    <span
                                        aria-hidden
                                        className="absolute -bottom-px left-0 right-0 h-0.5 bg-ember"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                    {activeTab === 'profile' && (
                        <div className="grid md:grid-cols-2 gap-6 md:gap-7">
                            <article className="card p-7 md:p-10">
                                <span className="eyebrow text-deep">Who you are</span>
                                <h3 className="mt-2 font-display font-semibold text-[1.3rem] leading-tight text-ink">
                                    Profile
                                </h3>
                                <div className="mt-7 space-y-6">
                                    <Row label="Email" value={user?.email} />
                                    <div className="grid grid-cols-2 gap-6">
                                        <Row label="Student ID" value={member.studentId} />
                                        <Row label="Branch" value="Aerospace" />
                                    </div>
                                </div>
                            </article>
                            <article className="card p-7 md:p-10 flex flex-col justify-center">
                                <span className="eyebrow text-ember">PDF record</span>
                                <h3 className="mt-2 font-display font-semibold text-[1.3rem] leading-tight text-ink">
                                    Membership one-pager
                                </h3>
                                <p className="text-[14.5px] text-ink-soft mt-3 leading-relaxed">
                                    A short document with your projects and badges. Sponsors or
                                    visiting companies ask for it sometimes. So do recruiters.
                                </p>
                                <button
                                    onClick={handleDownloadPortfolio}
                                    disabled={downloading}
                                    className="btn btn-primary mt-6 self-start"
                                >
                                    {downloading ? 'Building the PDF...' : 'Download the PDF'}
                                </button>
                            </article>
                        </div>
                    )}

                    {activeTab === 'registrations' && (
                        <div className="space-y-8">
                            <section>
                                <h3 className="font-display text-[1.2rem] font-semibold text-ink mb-5">
                                    Events you signed up for
                                </h3>
                                <div className="space-y-4">
                                    {registrations.length === 0 ? (
                                        <div className="card p-10 text-center border-dashed">
                                            <p className="text-ink-soft">
                                                Nothing yet. Pop into the calendar. We post new ones every other week.
                                            </p>
                                            <Link href="/events" className="btn btn-secondary mt-5 inline-flex">
                                                See upcoming events
                                            </Link>
                                        </div>
                                    ) : (
                                        registrations.map(reg => (
                                            <article key={reg.id} className="card p-6 md:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                                                <div>
                                                    <p className="eyebrow text-ink-muted">
                                                        {reg.eventDate
                                                            ? new Date(reg.eventDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
                                                            : 'Date TBD'}
                                                    </p>
                                                    <h3 className="mt-1 font-display font-semibold text-[1.15rem] leading-tight text-ink">
                                                        {reg.eventTitle}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                                    <span className="chip chip-completed">You are in</span>
                                                    <div className="flex gap-2 ml-auto sm:ml-0">
                                                        <Link
                                                            href={`/events/${reg.eventId}`}
                                                            className="p-3 bg-canvas-surface text-ink-muted hover:text-deep border border-line"
                                                            aria-label="Open event page"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteRegistration(reg.id)}
                                                            className="p-3 bg-canvas-surface text-ink-muted hover:text-ember border border-line"
                                                            title="Drop this event"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </section>

                            <section>
                                <h3 className="font-display text-[1.2rem] font-semibold text-ink mb-5">
                                    Project applications
                                </h3>
                                <div className="space-y-4">
                                    {projectRequests.length === 0 ? (
                                        <div className="card p-10 text-center border-dashed">
                                            <p className="text-ink-soft">
                                                No project applications yet. Browse the workshop and pick one that matches your week.
                                            </p>
                                            <Link href="/projects" className="btn btn-secondary mt-5 inline-flex">
                                                Browse projects
                                            </Link>
                                        </div>
                                    ) : (
                                        projectRequests.map(req => (
                                            <article key={req.id} className="card p-6 md:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                                                <div>
                                                    <p className="eyebrow text-ink-muted">
                                                        {req.projectType} · {req.semester}
                                                    </p>
                                                    <h3 className="mt-1 font-display font-semibold text-[1.15rem] leading-tight text-ink">
                                                        {req.projectTitle}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                                    <span className={
                                                        req.status === 'accepted' ? 'chip chip-completed' :
                                                        req.status === 'rejected' ? 'chip chip-recruiting' :
                                                        'chip chip-progress'
                                                    }>
                                                        {req.status === 'accepted' ? 'Accepted' : req.status === 'rejected' ? 'Did not match' : 'In review'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCancelProject(req.id, req.projectTitle)}
                                                        className="p-3 ml-auto sm:ml-0 bg-canvas-surface text-ink-muted hover:text-ember border border-line"
                                                        title="Cancel application"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </article>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="space-y-4">
                            {member.projects.map(proj => (
                                <article key={proj.id} className="card p-6 md:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                                    <div>
                                        <p className="eyebrow text-ink-muted">{proj.role}</p>
                                        <h3 className="mt-1 font-display font-semibold text-[1.15rem] leading-tight text-ink">
                                            {proj.name}
                                        </h3>
                                    </div>
                                    <span className="chip chip-progress">{proj.status}</span>
                                </article>
                            ))}
                            <Link
                                href="/projects"
                                className="block text-center py-6 border border-dashed border-line text-ink-soft hover:text-ink hover:border-deep duration-base ease-human"
                            >
                                + Join another project
                            </Link>
                        </div>
                    )}

                    {activeTab === 'badges' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
                            {member.badges.map(badge => (
                                <article key={badge.id} className="card p-7 md:p-8 text-center">
                                    <div className="text-4xl mb-4">{badge.emoji}</div>
                                    <h3 className="font-display font-semibold text-ink text-[14px] uppercase tracking-wide">
                                        {badge.name}
                                    </h3>
                                </article>
                            ))}
                            <article className="card p-7 md:p-8 text-center border-dashed bg-canvas-surface">
                                <div className="text-4xl mb-4 opacity-30">[A]</div>
                                <h3 className="font-display font-semibold text-ink-muted text-[14px] uppercase tracking-wide">
                                    Sub-team lead
                                </h3>
                                <p className="eyebrow text-ink-muted mt-3">Locked</p>
                            </article>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

function Row({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="eyebrow text-ink-muted">{label}</p>
            <p className="mt-1 font-display font-semibold text-ink text-[16px] leading-snug">
                {value || 'Empty'}
            </p>
        </div>
    );
}