import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OpportunityCard from '../components/OpportunityCard';
import { Opportunity } from '../types/opportunity';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

/**
 * Opportunities — human-crafted:
 *   • Filter pills use semantic chip variants — not feature-blue.
 *   • Off-black text and warm CTA mailing-list pill at bottom.
 *   • Generous search bar without harsh.
 */

const TYPES = [
  { id: 'all',         label: 'Everything' },
  { id: 'internship',  label: 'Internships' },
  { id: 'scholarship', label: 'Scholarships' },
  { id: 'competition', label: 'Competitions' },
  { id: 'research',    label: 'Research' },
];

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const q = query(collection(db, 'opportunities'), orderBy('deadline', 'asc'));
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({
          id: d.id, ...(d.data() as Omit<Opportunity, 'id'>),
        })) as Opportunity[];
        setOpportunities(items);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, []);  const filtered = opportunities.filter(op => {
    const typeMatch = filter === 'all' || op.type === filter;

    const searchMatch =
      op.title.toLowerCase().includes(search.toLowerCase()) ||
      op.organization?.toLowerCase().includes(search.toLowerCase());
    return !op.isArchived && typeMatch && searchMatch;
  });

  return (
    <div className="min-h-screen paper-surface text-ink">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-deep text-white topo-wash pt-28 md:pt-36 pb-12 md:pb-20">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-8">
              <span className="eyebrow text-spark">Career radar</span>
              <h1 className="mt-3 font-display text-[clamp(2.3rem,5.5vw,4rem)] font-semibold leading-[1.05] tracking-tight">
                Opportunities worth your<br /><span className="text-spark">airspeed.</span>
              </h1>
            </div>
            <div className="md:col-span-4 text-white/85 text-[15px] leading-relaxed">
              <p>
                Hand-picked internships, scholarships, and competitions. Curated
                weekly by the outreach team. Missed one? We email it the day it drops.
              </p>
              <a
                href="mailto:outreach@aiaa.zewailcity.edu.eg?subject=Add%20me%20to%20opportunities%20alerts"
                className="mt-4 inline-block marker-line text-spark font-medium"
              >
                Get the weekly email →
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        {/* Filters bar */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-5 mb-10 md:mb-14 items-stretch md:items-center">
          <div className="flex bg-paper border border-line p-1 overflow-x-auto">
            {TYPES.map(t => {
              const active = filter === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`px-5 py-2 font-display font-semibold text-[12px] tracking-wider uppercase duration-base ease-human ${
                    active ? 'bg-deep text-white' : 'text-ink-soft hover:text-ink'
                  }`}
                  aria-pressed={active}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 w-full md:max-w-md md:ml-auto">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" aria-hidden>⌕</span>
            <input
              type="text"
              placeholder="Search opportunities[..]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-5 py-3 bg-paper border border-line text-ink placeholder:text-ink-muted focus:border-iris focus:ring-2 focus:ring-iris/20 outline-none duration-base ease-human"
              aria-label="Search opportunities"
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="inline-block w-10 h-10 border-2 border-line border-t-deep animate-orbit" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {filtered.map(op => (
              <OpportunityCard key={op.id} opportunity={op} />
            ))}
          </div>
        ) : (
          <section className="text-center py-20 card border-dashed">
            <h3 className="font-display text-[1.4rem] font-semibold text-ink">No matches right now.</h3>
            <p className="lead mt-3 mx-auto max-w-md">
              Try a different filter. Or hit us up so we can surface what you&apos;re hunting for.
            </p>
            <a
              href="mailto:outreach@aiaa.zewailcity.edu.eg"
              className="inline-block mt-6 btn btn-secondary"
            >
              Tell us what you&apos;re looking for
            </a>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
