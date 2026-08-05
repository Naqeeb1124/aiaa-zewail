import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

/**
 * Resources (tools) — human-crafted:
 *   • Each category uses a hand-drawn-feeling SVG icon (NOT emoji).
 *   • Off-black ink; warm ember tone for "submit a suggestion".
 *   • Generous spacing, soft paper background.
 */

interface Category {
  title: string;
  description: string;
  icon: React.ReactNode;
  items: { name: string; link: string; type: string }[];
}

const TYPED_ICON: Record<string, React.ReactNode> = {
  'CAD':         <Glyph d="M4 4h12l3 3v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v3h12" />,
  'Simulation':  <Glyph d="M3 14V8m0 0V5a2 2 0 0 1 2-2h2m6 0h2a2 2 0 0 1 2 2v3m0 6v2a2 2 0 0 1-2 2h-2m-6 0H5a2 2 0 0 1-2-2v-2m10-6h2m-14 0h2m10 0V7m0 5v0m-6 0v-1" outer />,
  'Computing':   <Glyph d="M5 6h14M5 12h14M6 18h12M9 3v3m6-3v3" />,
  'CFD':         <Glyph d="M4 12c4-8 12-8 16 0-4 8-12 8-16 0zm0 0h16" />,
  'LaTeX/Word':  <Glyph d="M5 4h12M5 4v16M9 9h6M9 13h6M9 17h4" />,
  'Research':    <Glyph d="M5 5h10v10H5zM5 5l4 4 4-4M5 15h10M9 9v6" />,
  'Publications':<Glyph d="M5 4h12a2 2 0 0 1 2 2v12H7a2 2 0 0 1-2-2zm0 12v2a2 2 0 0 0 2 2h12" />,
  'Education':   <Glyph d="M3 8l9-4 9 4-9 4-9-4zm0 0v6m18-6v6m-9-2v6" />,
  'Jobs':        <Glyph d="M4 9h16v9H4zM9 9V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" />,
};

const CATEGORIES: Category[] = [
  {
    title: 'Software & simulation',
    description: 'The engineering tools we actually use on projects.',
    icon: <Glyph d="M4 6h6m4 0h6M4 12h6m4 0h6M4 18h6m4 0h6" />,
    items: [
      { name: 'SolidWorks Student Access', link: 'https://www.solidworks.com/product/students', type: 'CAD' },
      { name: 'ANSYS Student Edition',     link: 'https://www.ansys.com/academic/free-student-products', type: 'Simulation' },
      { name: 'MATLAB & Simulink',         link: 'https://matlab.mathworks.com/', type: 'Computing' },
      { name: 'OpenFOAM (Linux/WSL)',      link: 'https://www.openfoam.com/', type: 'CFD' },
    ],
  },
  {
    title: 'Technical writing',
    description: 'Templates for AIAA-style papers and project proposals.',
    icon: <Glyph d="M5 4h11l3 3v13H5zM16 4v3h3" />,
    items: [
      { name: 'AIAA Technical Paper Template (LaTeX)', link: 'https://www.overleaf.com/latex/templates/preparation-of-papers-for-aiaa-technical-journals/mqqbqqvyhtwm', type: 'LaTeX/Word' },
    ],
  },
  {
    title: 'Research & learning',
    description: 'Where we go to dig deeper than the textbook.',
    icon: <Glyph d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm5 12l3 3" />,
    items: [
      { name: 'NASA Technical Reports Server',  link: 'https://ntrs.nasa.gov/', type: 'Research' },
      { name: 'AIAA ARC Library',               link: 'https://arc.aiaa.org/', type: 'Publications' },
      { name: 'MIT OpenCourseWare — Aero/Astro', link: 'https://ocw.mit.edu/courses/aeronautics-and-astronautics/', type: 'Education' },
    ],
  },
  {
    title: 'Career',
    description: 'Tools that turn aerospace curiosity into a job.',
    icon: <Glyph d="M4 9h16v9H4zM9 9V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" />,
    items: [
      { name: 'AIAA Global Career Center', link: 'https://careercenter.aiaa.org/', type: 'Jobs' },
    ],
  },
];

export default function Resources() {
  return (
    <div className="min-h-screen paper-surface text-ink">
      <Navbar />

      <section className="relative overflow-hidden bg-deep text-white topo-wash pt-28 md:pt-36 pb-16 md:pb-24">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <span className="eyebrow text-spark">Knowledge base</span>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">
                Tools that<br /><span className="text-spark">actually help.</span>
              </h1>
            </div>
            <div className="md:col-span-5 text-white/85 text-[15.5px] leading-relaxed">
              <p>
                The software, databases, and templates our members reach for
                when they&apos;re working on real projects. Curated, not
                thrown at a wall.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-14 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7">
          {CATEGORIES.map(cat => (
            <article key={cat.title} className="card p-7 md:p-9">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 bg-canvas-surface text-deep flex items-center justify-center border border-line">
                  {cat.icon}
                </div>
                <div>
                  <h2 className="font-display font-semibold text-[1.4rem] text-ink leading-tight">{cat.title}</h2>
                  <p className="text-[14.5px] text-ink-soft mt-1">{cat.description}</p>
                </div>
              </div>

              <ul className="space-y-2.5">
                {cat.items.map(item => (
                  <li key={item.name}>
                    <a
                      href={item.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 p-3.5 bg-canvas-surface border border-line hover:border-iris duration-base ease-human group"
                    >
                      <span className="text-ink group-hover:text-deep font-medium text-[14.5px]">
                        {item.name}
                      </span>
                      <span className="eyebrow text-ink-muted flex items-center gap-2">
                        <span className="w-7 h-7 bg-paper border border-line flex items-center justify-center">
                          {TYPED_ICON[item.type] || <Glyph d="M5 5h10v10H5z" />}
                        </span>
                        {item.type}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Submit-a-tool CTA */}
        <section className="mt-16 md:mt-20 paper-surface border border-line p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <span className="eyebrow text-ember">Missing something?</span>
            <h3 className="mt-2 font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-tight text-ink">
              Tell us what tool should be on this list.
            </h3>
            <p className="mt-3 text-[15px] text-ink-soft leading-relaxed">
              If you&apos;ve used a resource that made your aerospace work easier,
              we want to know about it.
            </p>
          </div>
          <Link href="/contact" className="btn btn-primary self-start md:self-auto">
            Submit a resource
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* --- Inline glyph: a single tiny ink-stroke SVG icon block --- */
function Glyph({ d, outer }: { d: string; outer?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`w-6 h-6 ${outer ? 'text-iris' : 'text-deep'}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}
