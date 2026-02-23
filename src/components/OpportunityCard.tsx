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
            case 'internship': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'scholarship': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'competition': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'research': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const handleApply = (e: React.MouseEvent) => {
        if (!auth.currentUser) {
            e.preventDefault();
            alert("Please login to access opportunities.");
            return;
        }
        if (!isOfficialMember) {
            e.preventDefault();
            alert("Only official branch members can access application links. Please apply for membership first.");
        }
    };

    return (
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 flex flex-col h-full group">
            <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getTypeColor(opportunity.type)}`}>
                    {opportunity.type}
                </span>
                {isExpired && (
                    <span className="px-2 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded border border-red-100">
                        Expired
                    </span>
                )}
            </div>

            <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-featured-blue transition-colors">
                {opportunity.title}
            </h3>
            <p className="text-slate-500 font-bold text-sm mb-4">
                {opportunity.organization} • <span className="text-slate-400 font-medium">{opportunity.location}</span>
            </p>

            <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                {opportunity.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
                {opportunity.tags?.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        #{tag}
                    </span>
                ))}
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline</p>
                    <p className={`text-sm font-bold ${isExpired ? 'text-red-500' : 'text-slate-700'}`}>
                        {opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}
                    </p>
                </div>

                <a 
                    href={isOfficialMember ? opportunity.link : '#'} 
                    target={isOfficialMember ? "_blank" : undefined}
                    rel={isOfficialMember ? "noopener noreferrer" : undefined}
                    onClick={handleApply}
                    className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all shadow-lg active:scale-95 transform hover:-translate-y-0.5 ${
                        isOfficialMember 
                        ? 'bg-featured-blue text-white hover:bg-featured-green' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                >
                    {isOfficialMember ? 'Apply Now' : 'Members Only'}
                </a>
            </div>
        </div>
    );
}
