import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OpportunityCard from '../components/OpportunityCard';
import { Opportunity } from '../types/opportunity';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function Opportunities() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchOpportunities = async () => {
            try {
                const q = query(collection(db, 'opportunities'), orderBy('deadline', 'asc'));
                const querySnapshot = await getDocs(q);
                const fetchedOps = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Opportunity[];
                setOpportunities(fetchedOps);
            } catch (error) {
                console.error("Error fetching opportunities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOpportunities();
    }, []);

    const filteredOpportunities = opportunities.filter(op => {
        const matchesType = filter === 'all' || op.type === filter;
        const matchesSearch = op.title.toLowerCase().includes(search.toLowerCase()) || 
                              op.organization.toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            
            {/* Header */}
            <section className="pt-32 md:pt-72 pb-16 md:pb-20 bg-featured-blue text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter">
                        Career <span className="text-white/80 italic">Opportunities</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl font-medium leading-relaxed">
                        Find internships, scholarships, and competitions to launch your aerospace career.
                        Updated weekly by the AIAA Zewail City team.
                    </p>
                </div>
            </section>

            {/* Filters & Content */}
            <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="flex flex-col md:flex-row gap-6 mb-16 items-center justify-between">
                    {/* Filter Tabs */}
                    <div className="flex bg-white p-1.5 rounded-full shadow-sm border border-slate-200 overflow-x-auto max-w-full">
                        {['all', 'internship', 'scholarship', 'competition', 'research'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    filter === type 
                                    ? 'bg-featured-blue text-white shadow-md' 
                                    : 'text-slate-400 hover:text-featured-blue hover:bg-slate-50'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-96">
                        <input
                            type="text"
                            placeholder="Search opportunities..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-full focus:ring-2 focus:ring-zewail-cyan focus:border-transparent outline-none shadow-sm font-medium transition-all"
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zewail-cyan"></div>
                    </div>
                ) : filteredOpportunities.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOpportunities.map(op => (
                            <OpportunityCard key={op.id} opportunity={op} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner">
                        <div className="text-6xl mb-6">🔭</div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">No results found</h3>
                        <p className="text-slate-400 font-medium">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
