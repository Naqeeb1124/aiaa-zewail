import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// UPDATED: Tracks based on Zewail City Aerospace Engineering Curriculum (SPC)
const TRACKS = [
    {
        id: 'propulsion',
        title: 'Propulsion & Aerodynamics',
        icon: '🚀',
        color: 'from-[#2b4b77] to-[#00b4d1]',
        steps: [
            { 
                title: 'Foundations', 
                description: 'Build the core thermal and fluid knowledge required for propulsion systems.', 
                resources: ['ENGR 205: Thermodynamics', 'ENGR 207: Fluid Mechanics'] // [cite: 16]
            },
            { 
                title: 'Aerodynamics', 
                description: 'Study subsonic potential flows and supersonic/hypersonic fluid dynamics.', 
                resources: ['SPC 307: Aerodynamics', 'SPC 308: Supersonic & Hypersonic Fluid Dynamics'] // [cite: 15, 21]
            },
            { 
                title: 'Propulsion Systems', 
                description: 'Analysis of air-breathing and rocket engines, mission analysis, and performance relations.', 
                resources: ['SPC 491: Jet Propulsion', 'Sutton & Biblarz (Textbook)'] // [cite: 25, 26]
            },
            { 
                title: 'Advanced Applications', 
                description: 'Deep dive into thermodynamic cycles, gas mixtures, and reacting systems.', 
                resources: ['SPC 406: Advanced Thermodynamics', 'SPC 509: Aircraft Conceptual Design'] // [cite: 17, 27]
            }
        ]
    },
    {
        id: 'structures',
        title: 'Structures & Materials',
        icon: '🔩',
        color: 'from-[#1a3d6d] to-[#2b4b77]',
        steps: [
            { 
                title: 'Mechanics & Dynamics', 
                description: 'Fundamentals of particle and rigid body dynamics using Newtonian and energy approaches.', 
                resources: ['SPC 218: Dynamics of Particles', 'ENGR 201: Statics'] // [cite: 13]
            },
            { 
                title: 'Aerospace Structures', 
                description: 'Analysis of structural components specific to aircraft and spacecraft design.', 
                resources: ['SPC 316: Aerospace Structures', 'Hibbeler (Mechanics)'] // [cite: 29]
            },
            { 
                title: 'Advanced Materials', 
                description: 'Modeling of composite materials, micromechanics of plies, and smart structures (piezoelectric/shape memory).', 
                resources: ['SPC 526: Advanced Materials for Aero Structures', 'ASM Handbook'] // 
            },
            { 
                title: 'Specialized Systems', 
                description: 'Advanced structural analysis and interaction with natural surfaces/thermal emissions.', 
                resources: ['SPC 527: Advanced Aerospace Structures', 'NASA Standards'] // [cite: 31]
            }
        ]
    },
    {
        id: 'avionics',
        title: 'Avionics & Control',
        icon: '🛰️',
        color: 'from-[#2b4b77] to-[#78af03]',
        steps: [
            { 
                title: 'Electronics', 
                description: 'Analog and digital microelectronic circuits: Op-amps, diodes, BJTs, and FETs.', 
                resources: ['SPC 227: Analog & Digital Electronics', 'Circuit Analysis Fundamentals'] // [cite: 14]
            },
            { 
                title: 'Control Systems', 
                description: 'Classical and modern control theory including PID and State-Space analysis.', 
                resources: ['SPC 328: Classical & Modern Control', 'MATLAB/Simulink'] // [cite: 21]
            },
            { 
                title: 'Robotics & Mechatronics', 
                description: 'Vision, motion planning, kinematics, and microcontroller-driven robot construction.', 
                resources: ['SPC 428: Mechatronics & Robotics', 'Arduino/C++'] // [cite: 20, 22]
            },
            { 
                title: 'Guidance & Navigation', 
                description: 'Optimal control theory and instrumentation for flight guidance.', 
                resources: ['SPC 504: Optimal Control', 'SPC 303: Remote Sensing (Elective)'] // [cite: 26, 22]
            }
        ]
    }
];

export default function Roadmaps() {
    const [activeTrack, setActiveTrack] = useState(TRACKS[0]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            
            {/* Header */}
            <section className="pt-32 md:pt-72 pb-16 md:pb-20 bg-featured-blue text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-3xl">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-black mb-6 uppercase tracking-widest">
                                Zewail City Curriculum
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight uppercase tracking-tighter">
                                Engineering <span className="text-white/80 italic">Roadmaps</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-medium">
                                Curated learning paths based on the official Aerospace Engineering (SPC) study plan.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                {/* Track Selector */}
                <div className="flex flex-wrap gap-4 mb-16">
                    {TRACKS.map((track) => (
                        <button
                            key={track.id}
                            onClick={() => setActiveTrack(track)}
                            className={`flex items-center gap-3 px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-all border-2 ${
                                activeTrack.id === track.id 
                                ? 'bg-featured-blue border-featured-blue text-white shadow-xl scale-105 transform -translate-y-1' 
                                : 'bg-white border-slate-100 text-slate-400 hover:border-featured-blue hover:text-featured-blue'
                            }`}
                        >
                            <span className="text-xl">{track.icon}</span>
                            {track.title}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Roadmap Steps */}
                    <div className="lg:col-span-2 space-y-12 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-8 top-4 bottom-4 w-1 bg-slate-200 rounded-full hidden md:block"></div>

                        {activeTrack.steps.map((step, idx) => (
                            <div key={idx} className="relative pl-0 md:pl-20 group">
                                {/* Step Indicator */}
                                <div className={`absolute left-4 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-4 border-slate-200 z-10 hidden md:flex items-center justify-center font-bold text-xs group-hover:border-featured-blue group-hover:text-featured-blue transition-colors`}>
                                    {idx + 1}
                                </div>

                                <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
                                    <h3 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight leading-tight">{step.title}</h3>
                                    <p className="text-slate-500 mb-8 leading-relaxed font-medium text-sm">{step.description}</p>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        {step.resources.map((res, i) => (
                                            <span key={i} className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100">
                                                📚 {res}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Info */}
                    <div className="lg:col-span-1">
                        <div className={`sticky top-32 p-10 rounded-[40px] bg-gradient-to-br from-featured-blue to-aiaa-blue text-white shadow-xl overflow-hidden relative group`}>
                            <div className="absolute top-0 right-0 w-full h-full bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
                            <div className="relative z-10">
                                <div className="text-6xl mb-8 transform group-hover:scale-110 transition-transform duration-700">{activeTrack.icon}</div>
                                <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter">{activeTrack.title}</h2>
                                <p className="text-white/70 mb-10 leading-relaxed font-medium">
                                    This roadmap aligns with the Zewail City SPC course catalog and elective requirements.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 text-xl">🎯</div>
                                        <span className="font-black uppercase tracking-widest text-[10px]">Accredited Path</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 text-xl">🛠️</div>
                                        <span className="font-black uppercase tracking-widest text-[10px]">Project Integration</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 text-xl">🎓</div>
                                        <span className="font-black uppercase tracking-widest text-[10px]">SPC Electives</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}