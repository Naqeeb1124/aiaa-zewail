import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '../lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';

export default function About() {
    const [memberCount, setMemberCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const coll = collection(db, 'members');
                const snapshot = await getCountFromServer(coll);
                setMemberCount(snapshot.data().count);
            } catch (error) {
                console.error("Error fetching member count:", error);
            }
        };
        fetchCount();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            
            {/* Hero Section */}
            <section className="pt-32 md:pt-72 pb-16 md:pb-32 bg-featured-blue text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-black mb-6 uppercase tracking-widest">
                            Who We Are
                        </span>
                        <h1 className="text-4xl md:text-7xl font-black mb-8 leading-tight uppercase tracking-tighter">
                            Egypt&apos;s Aerospace <span className="text-white/70 italic">Powerhouse</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-white/80 leading-relaxed font-medium">
                            We are the only active AIAA student branch in Egypt, stationed at the country&apos;s premier hub for scientific research—Zewail City of Science and Technology.
                        </p>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 py-16 md:py-32">
                
                {/* Zewail City & Aerospace Section */}
                <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center mb-24 md:mb-40">
                    <div className="order-2 md:order-1">
                        <div className="relative rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 group h-[300px] md:h-[600px]">
                             <Image 
                                src="/hero-mock.jpg" 
                                alt="Zewail City Campus" 
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-8 md:p-12">
                                <div>
                                    <h4 className="text-white font-black text-xl md:text-2xl mb-2 uppercase tracking-tight">Aerospace Dept.</h4>
                                    <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest">Zewail City of Science & Technology</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="order-1 md:order-2 flex flex-col justify-center h-full">
                        <span className="text-[10px] font-black text-featured-blue uppercase tracking-[0.3em] mb-6">Our Home Base</span>
                        <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 md:mb-8 uppercase tracking-tighter leading-tight">Excellence in <br/> <span className="text-featured-blue">Engineering</span></h3>
                        <div className="space-y-6 md:space-y-8 text-slate-600 leading-relaxed text-base md:text-lg font-medium">
                            <p>
                                Zewail City of Science and Technology stands as a beacon of scientific renaissance in Egypt. Within this ecosystem, the <strong className="text-slate-900">Aerospace Engineering Department</strong> offers a world-class curriculum designed to equip students with the theoretical depth and practical skills required for the modern aerospace sector.
                            </p>
                            <p>
                                Our members tackle rigorous coursework ranging from <span className="italic font-bold text-featured-blue">Aerospace Structures</span> to advanced orbital mechanics. As a student branch, we complement this academic rigor by providing the &quot;hands-on&quot; dimension—transforming textbook equations into flying rockets, autonomous drones, and research papers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Mission & Vision Grid */}
                <div className="grid md:grid-cols-3 gap-8 md:gap-10 mb-24 md:mb-40">
                    <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                        <div className="w-14 md:w-16 h-14 md:h-16 bg-slate-50 text-featured-blue rounded-[20px] flex items-center justify-center text-2xl md:text-3xl mb-8 md:mb-10 group-hover:bg-featured-blue group-hover:text-white transition-colors duration-500 shadow-inner">🚀</div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Technical Mastery</h3>
                        <p className="text-slate-500 leading-relaxed font-medium text-sm md:text-base">
                            We don&apos;t just study aerospace; we practice it. Our project teams work on sounding rockets, UAVs, and cubesats, applying engineering principles to real-world challenges.
                        </p>
                    </div>
                    <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                        <div className="w-14 md:w-16 h-14 md:h-16 bg-slate-50 text-featured-green rounded-[20px] flex items-center justify-center text-2xl md:text-3xl mb-8 md:mb-10 group-hover:bg-featured-green group-hover:text-white transition-colors duration-500 shadow-inner">🌍</div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">National Impact</h3>
                        <p className="text-slate-500 leading-relaxed font-medium text-sm md:text-base">
                            As the only active branch in the nation, we carry the torch for Egyptian student aerospace. We organize workshops and events to spread awareness and inspire the next generation.
                        </p>
                    </div>
                    <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                        <div className="w-14 md:w-16 h-14 md:h-16 bg-slate-50 text-hover-blue rounded-[20px] flex items-center justify-center text-2xl md:text-3xl mb-8 md:mb-10 group-hover:bg-hover-blue group-hover:text-white transition-colors duration-500 shadow-inner">🤝</div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">Industry Network</h3>
                        <p className="text-slate-500 leading-relaxed font-medium text-sm md:text-base">
                            We bridge the gap between university and industry, providing our members with networking opportunities, mentorship, and exposure to global aerospace leaders.
                        </p>
                    </div>
                </div>

                {/* Global AIAA Section (Consistent Theme) */}
                <div className="bg-gradient-to-br from-featured-blue to-aiaa-blue rounded-[40px] p-8 md:p-20 relative overflow-hidden text-white shadow-xl">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-full h-full bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="relative z-10 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-black mb-6 uppercase tracking-widest">
                                The Global Network
                            </span>
                            <h3 className="text-3xl md:text-5xl font-black mb-6 md:mb-8 uppercase tracking-tighter leading-tight">Part of <br/> Something <span className="text-white/70 italic">Bigger</span></h3>
                            <p className="text-base md:text-lg text-white/80 leading-relaxed mb-8 md:mb-10 font-medium">
                                Being part of AIAA Zewail City means joining a global family of over 30,000 members across 91 countries. The American Institute of Aeronautics and Astronautics (AIAA) is the world&apos;s largest technical society dedicated to the global aerospace profession.
                            </p>
                            <a 
                                href="https://www.aiaa.org/about-aiaa" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 bg-white text-featured-blue px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-featured-green hover:text-white transition-all shadow-lg transform hover:-translate-y-0.5"
                            >
                                Visit AIAA.org <span className="text-lg">→</span>
                            </a>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-[40px] text-center shadow-inner">
                            <div className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter">
                                {memberCount !== null ? memberCount : '...'}
                            </div>
                            <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-8 md:mb-10">Active Members at Zewail City</div>
                            <Link href="/join" legacyBehavior>
                                <a className="block w-full py-4 bg-white text-featured-blue rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-featured-green hover:text-white transition-all shadow-xl transform hover:-translate-y-0.5">
                                    Join Our Chapter
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}