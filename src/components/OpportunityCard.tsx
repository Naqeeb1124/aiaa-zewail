import React, { useState, useEffect } from 'react';
import { Opportunity } from '../types/opportunity';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '../types/user';
import { useAdmin } from '../hooks/useAdmin';

interface Props {
    opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: Props) {
    const { isAdmin } = useAdmin();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const isExpired = opportunity.deadline ? new Date(opportunity.deadline) < new Date() : false;

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {
                    if (snap.exists()) setUserProfile(snap.data() as UserProfile);
                });
                return unsubProfile;
            } else {
                setUserProfile(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const isOfficialMember = userProfile?.role === 'member' || isAdmin;

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'internship': return 'bg-canvas text-sea border-line';
            case 'scholarship': return 'bg-iris-soft text-iris border-iris-soft';
            case 'competition': return 'bg-accent-orange-soft text-ember border-accent-orange-soft';
            case 'research': return 'bg-signal-soft text-growth border-signal-soft';
            default: return 'bg-line text-ink-soft border-line';
        }
    };

    const handleApply = (e: React.MouseEvent) => {
        if (!auth.currentUser) {
            e.preventDefault();
            alert("Sign in first to open application links.");
            return;
        }
        if (!isOfficialMember) {
            e.preventDefault();
            alert("This link is for branch members. Apply on the join page if you are not in yet.");
        }
    };

    return (
        <div className="bg-white p-8 border border-line transition-all duration-500 flex flex-col h-full group">
            <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${getTypeColor(opportunity.type)}`}>
                    {opportunity.type}
                </span>
                {isExpired && (
                    <span className="px-2 py-1 bg-accent-orange-soft text-ember text-[10px] font-bold uppercase border border-accent-orange-soft">
                        Expired
                    </span>
                )}
            </div>

            <h3 className="text-2xl font-bold text-ink mb-2 group-hover:text-deep transition-colors">
                {opportunity.title}
            </h3>
            <p className="text-ink-soft font-bold text-sm mb-4">
                {opportunity.organization} • <span className="text-ink-muted font-medium">{opportunity.location}</span>
            </p>

            <p className="text-ink-soft text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                {opportunity.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
                {opportunity.tags?.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-ink-muted bg-canvas px-2 py-1 border border-line">
                        #{tag}
                    </span>
                ))}
            </div>

            <div className="pt-6 border-t border-canvas flex items-center justify-between mt-auto">
                <div className="text-left">
                    <p className="text-[10px] font-black text-ink-muted uppercase tracking-widest">Deadline</p>
                    <p className={`text-sm font-bold ${isExpired ? 'text-ember' : 'text-ink'}`}>
                        {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                    </p>
                </div>

                <a 
                    href={isOfficialMember ? opportunity.link : '#'} 
                    target={isOfficialMember ? "_blank" : undefined}
                    rel={isOfficialMember ? "noopener noreferrer" : undefined}
                    onClick={handleApply}
                    className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 transform hover:-translate-y-0.5 ${
                        isOfficialMember 
                        ? 'bg-deep text-white hover:bg-growth' 
                        : 'bg-line text-ink-muted cursor-not-allowed-none'
                    }`}
                >
                    {isOfficialMember ? 'Open link' : 'Members only'}
                </a>
            </div>
        </div>
    );
}
