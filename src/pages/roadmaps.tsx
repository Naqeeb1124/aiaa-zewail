import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/**
 * Roadmaps — human-crafted:
 *   • Vertical timeline with numbered nodes (NOT a generic 3-column grid).
 *   • Each track has a custom ink SVG glyph (NOT emoji).
 *   • Off-black body, accessible focus ring in iris.
 */

interface Step {
  title: string;
  description: string;
  resources: string[];
}
interface Track {
  id: string;
  title: string;
  glyph: React.ReactNode;
  intro: string;
  steps: Step[];
}

const tracks: Track[] = [
  {
    id: 'propulsion',
    title: 'Propulsion & aerodynamics',
    glyph: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3c5 4 7 9 7 14-2 2-12 2-14 0 0-5 2-10 7-14z" />
        <path d="M9 14h6M12 9v3" />
      </svg>
    ),
    intro: 'Thermodynamics → aerodynamics → propulsion → advanced cycles.',
    steps: [
      {
        title: 'Foundations',
        description: 'Core thermal and fluid knowledge for propulsion systems.',
        resources: ['ENGR 205 · Thermodynamics', 'ENGR 207 · Fluid Mechanics'],
      },
      {
        title: 'Aerodynamics',
        description: 'Subsonic potential flow up through supersonic and hypersonic regimes.',
        resources: ['SPC 307 · Aerodynamics', 'SPC 308 · Supersonic & Hypersonic Fluid Dynamics'],
      },
      {
        title: 'Propulsion systems',
        description: 'Air-breathing engines, mission analysis, performance.',
        resources: ['SPC 491 · Jet Propulsion', 'Sutton & Biblarz (textbook)'],
      },
      {
        title: 'Advanced applications',
        description: 'Thermodynamic cycles, gas mixtures, reacting systems.',
        resources: ['SPC 406 · Advanced Thermodynamics', 'SPC 509 · Aircraft Conceptual Design'],
      },
    ],
  },
  {
    id: 'structures',
    title: 'Structures & materials',
    glyph: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 8h18M3 16h18M5 8v8M19 8v8M9 6l3 -3 3 3M9 18l3 3 3 -3" />
      </svg>
    ),
    intro: 'Mechanics → aerospace structures → advanced materials → specialised systems.',
    steps: [
      {
        title: 'Mechanics & dynamics',
        description: 'Particle and rigid body dynamics, Newtonian and energy methods.',
        resources: ['SPC 218 · Dynamics of Particles', 'ENGR 201 · Statics'],
      },
      {
        title: 'Aerospace structures',
        description: 'Aircraft and spacecraft structural components.',
        resources: ['SPC 316 · Aerospace Structures', 'Hibbeler (Mechanics)'],
      },
      {
        title: 'Advanced materials',
        description: 'Composite materials, micromechanics, smart structures.',
        resources: ['SPC 526 · Advanced Materials for Aero Structures', 'ASM Handbook'],
      },
      {
        title: 'Specialised systems',
        description: 'Advanced structural analysis and interaction effects.',
        resources: ['SPC 527 · Advanced Aerospace Structures', 'NASA Standards'],
      },
    ],
  },
  {
    id: 'avionics',
    title: 'Avionics & control',
    glyph: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="6" width="18" height="12" rx="1" />
        <path d="M3 12h18M9 10v4M15 10v4" />
      </svg>
    ),
    intro: 'Electronics → control → robotics → guidance & navigation.',
    steps: [
      {
        title: 'Electronics',
        description: 'Analog and digital circuits: op-amps, diodes, BJTs, FETs.',
        resources: ['SPC 227 · Analog & Digital Electronics', 'Circuit analysis fundamentals'],
      },
      {
        title: 'Control systems',
        description: 'Classical and modern control: PID and state-space.',
        resources: ['SPC 328 · Classical & Modern Control', 'MATLAB / Simulink'],
      },
      {
        title: 'Robotics & mechatronics',
        description: 'Vision, motion planning, kinematics, microcontroller builds.',
        resources: ['SPC 428 · Mechatronics & Robotics', 'Arduino / C++'],
      },
      {
        title: 'Guidance & navigation',
        description: 'Optimal control and instrumentation for flight guidance.',
        resources: ['SPC 504 · Optimal Control', 'SPC 303 · Remote Sensing (elective)'],
      },
    ],
  },
];

export default function Roadmaps() {
  const [active, setActive] = useState(tracks[0]);

  return (
    <div className="min-h-screen paper-surface text-ink">
      <Navbar />

      <section className="relative overflow-hidden bg-deep text-white topo-wash pt-28 md:pt-36 pb-16 md:pb-24">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <span className="eyebrow text-spark">Curricula</span>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">
                Where to start<br /><span className="text-spark">in aerospace.</span>
              </h1>
            </div>
            <div className="md:col-span-5 text-white/85 text-[15.5px] leading-relaxed">
              <p>
                Three learning paths aligned with the Zewail City aerospace
                (SPC) curriculum. Pair them with the kinds of projects you
                can build alongside. Pick a thread. Pull it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-14 md:py-24">
        {/* Track switcher */}
        <div className="flex flex-wrap gap-3 mb-10 md:mb-14">
          {tracks.map(t => {
            const isActive = t.id === active.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t)}
                className={`flex items-center gap-3 px-5 py-3 font-display font-semibold text-[13px] tracking-wide border duration-base ease-human ${
                  isActive ? 'bg-deep text-white border-deep' : 'bg-paper border-line text-ink-soft hover:border-deep hover:text-deep'
                }`}
                aria-pressed={isActive}
              >
                <span className={isActive ? 'text-spark' : 'text-deep'}>{t.glyph}</span>
                {t.title}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Timeline */}
          <section className="lg:col-span-8">
            <p className="lead mb-8">{active.intro}</p>
            <ol className="relative">
              <span aria-hidden className="absolute left-[19px] top-3 bottom-3 w-px bg-line" />
              {active.steps.map((step, idx) => (
                <li key={step.title} className="relative pl-14 pb-10 last:pb-0">
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 w-10 h-10 bg-paper border-2 border-deep text-deep flex items-center justify-center font-display font-semibold text-[14px] duration-base ease-human hover:bg-deep hover:text-spark"
                  >
                    {idx + 1}
                  </span>
                  <article className="card p-6 md:p-7">
                    <h3 className="font-display font-semibold text-[1.2rem] leading-snug text-ink">{step.title}</h3>
                    <p className="mt-2 text-[14.5px] text-ink-soft leading-relaxed">{step.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {step.resources.map(r => (
                        <span key={r} className="chip chip-neutral">{r}</span>
                      ))}
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          </section>

          {/* Side fact card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 card p-8">
              <span className="eyebrow text-ember">On this track</span>
              <div className="mt-3 flex items-center gap-4">
                <span className="w-14 h-14 bg-canvas-surface text-deep flex items-center justify-center border border-line">
                  {active.glyph}
                </span>
                <h3 className="font-display font-semibold text-[1.3rem] leading-tight text-ink">
                  {active.title}
                </h3>
              </div>
              <p className="mt-5 text-[14.5px] text-ink-soft leading-relaxed">
                Course codes from the official Zewail City SPC curriculum.
                Pair any of these with a hands-on project and you&apos;ll
                feel like an aerospace engineer by month three.
              </p>
              <ul className="mt-6 space-y-3 text-[14px]">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-growth" />
                  Aligned to the degree
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-deep" />
                  Project-linked
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-ember" />
                  Elective-friendly
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
