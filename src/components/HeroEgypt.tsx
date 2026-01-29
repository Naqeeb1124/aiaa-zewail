import React from 'react';
import Link from 'next/link';

export default function HeroEgypt() {
  return (
    <section className="pt-12 md:pt-24 pb-12 md:pb-20 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-featured-blue/10 text-featured-blue border border-featured-blue/20 text-xs font-bold mb-6 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-featured-green animate-pulse"></span>
            Egypt's Only Active AIAA Student Branch
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-featured-blue mb-6">
            From Egypt <br />
            To The Stars.
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
            Connecting aerospace-minded students at Zewail City with projects, events, and the global industry. We are the national gateway to the world's largest aerospace society.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/join" legacyBehavior>
              <a className="px-8 py-3 rounded-full bg-featured-blue text-white font-bold hover:bg-featured-green transition-all transform hover:-translate-y-0.5">
                Join the Mission
              </a>
            </Link>
            <Link href="/about" legacyBehavior>
              <a className="px-8 py-3 rounded-full border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all">
                Our Story
              </a>
            </Link>
          </div>
        </div>

        <div className="relative hidden md:flex items-center justify-center">
          <div className="w-full max-w-md relative aspect-square">
            {/* The SVG Map from file */}
            <img 
              src="/egypt.svg" 
              alt="Map of Egypt" 
              className="w-full h-full object-contain relative z-10" 
            />
            
            {/* Zewail City Marker */}
            <div className="absolute top-[15%] left-[59%] z-20 pointer-events-none">
               <div className="w-4 h-4 bg-featured-green rounded-full animate-ping absolute -inset-0 opacity-75"></div>
               <div className="w-3 h-3 bg-featured-green rounded-full border-2 border-white relative"></div>
               <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-slate-100 whitespace-nowrap">
                  <span className="text-[10px] font-black text-featured-blue uppercase tracking-tighter">Zewail City</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}