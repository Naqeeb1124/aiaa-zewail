import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

const RESOURCES = [
    {
        category: "Software & Simulation",
        description: "Standard engineering tools used in our technical projects.",
        icon: "💻",
        items: [
            { name: "SolidWorks Student Access", link: "https://www.solidworks.com/product/students", type: "CAD" },
            { name: "ANSYS Student Edition", link: "https://www.ansys.com/academic/free-student-products", type: "Simulation" },
            { name: "MATLAB & Simulink", link: "https://matlab.mathworks.com/", type: "Computing" },
            { name: "OpenFOAM (Linux/WSL)", link: "https://www.openfoam.com/", type: "CFD" }
        ]
    },
    {
        category: "Technical Writing",
        description: "Official templates for AIAA-style reports and proposals.",
        icon: "📝",
        items: [
            { name: "AIAA Technical Paper Template", link: "https://www.overleaf.com/latex/templates/preparation-of-papers-for-aiaa-technical-journals/mqqbqqvyhtwm", type: "LaTeX/Word" },
        ]
    },
    {
        category: "Learning Portals",
        description: "External databases for aerospace research and education.",
        icon: "📚",
        items: [
            { name: "NASA Technical Reports Server", link: "https://ntrs.nasa.gov/", type: "Research" },
            { name: "AIAA ARC Library", link: "https://arc.aiaa.org/", type: "Publications" },
            { name: "MIT OpenCourseWare - Aero/Astro", link: "https://ocw.mit.edu/courses/aeronautics-and-astronautics/", type: "Education" }
        ]
    },
    {
        category: "Professional Development",
        description: "Resources to help you launch your aerospace career.",
        icon: "🚀",
        items: [
            { name: "AIAA Global Career Center", link: "https://careercenter.aiaa.org/", type: "Jobs" }
        ]
    }
];

export default function Resources() {
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
                                Member Knowledge Base
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter">
                                Engineering <span className="text-white/80 italic">Resources</span>
                            </h1>
                            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-medium">
                                A curated directory of tools, software, and documentation to support your technical growth at AIAA Zewail City.
                            </p>
                        </div>
                        <div className="hidden lg:block">
                            <div className="w-32 h-32 bg-white/5 rounded-[40px] flex items-center justify-center text-6xl border border-white/10 shadow-2xl backdrop-blur-sm">
                                🛠️
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="grid md:grid-cols-2 gap-12">
                    {RESOURCES.map((cat, idx) => (
                        <div key={idx} className="bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group hover:-translate-y-1">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-featured-blue group-hover:text-white transition-colors duration-500">
                                    {cat.icon}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{cat.category}</h2>
                                    <p className="text-slate-500 text-sm">{cat.description}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {cat.items.map((item, i) => (
                                    <a 
                                        key={i} 
                                        href={item.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-featured-blue/5 border border-transparent hover:border-featured-blue/20 transition-all group/item"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-700 font-bold text-sm group-hover/item:text-featured-blue">{item.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                                            {item.type}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-20 bg-featured-blue rounded-[40px] p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4 font-black tracking-tight">Suggest a Resource</h2>
                        <p className="text-slate-300 mb-8 max-w-2xl mx-auto text-lg">
                            Know a tool or database that would benefit the branch? Let our technical team know so we can add it to the hub.
                        </p>
                        <Link href="/contact" legacyBehavior>
                            <a className="inline-block px-10 py-4 rounded-full bg-featured-green text-white font-black uppercase tracking-widest text-sm hover:bg-white hover:text-featured-blue transition-all shadow-xl transform hover:-translate-y-0.5">
                                Submit Resource Suggestion
                            </a>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}