import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '../lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';

/**
 * About — human-crafted:
 *   • Only the hero band uses deep navy. The main body sits on warm paper.
 *   • Asymmetric 5/7 + 7/5 zig-zag avoids the centered duplicate-grid anti-pattern.
 *   • Off-black ink for body copy; warm ember for the most important moment.
 *   • Voice is peer-to-peer, not "AIAA corporate".
 */

const PRINCIPLES = [
  {
    eyebrow: '01 · Build',
    title: 'We build. We study. Mostly we build.',
    body: 'Aerospace gets real when you cut metal, fly control loops, and argue about fins over coffee. Every member gets hands on a flight-qualified or flight-bound artefact.',
    accent: 'text-ember',
  },
  {
    eyebrow: '02 · Belong',
    title: "There's a place for your weird idea.",
    body: "Cubesats, balloons, gliders, high-altitude experiments. We'll help you find a build crew and a budget, no matter how niche.",
    accent: 'text-deep',
  },
  {
    eyebrow: '03 · Bridge',
    title: 'We hand you a passport to global aerospace.',
    body: 'As an AIAA chapter, your membership card opens doors to 30,000+ peers in 91 countries, plus conferences, scholarships, and a career centre.',
    accent: 'text-growth',
  },
];

export default function About() {
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const coll = collection(db, 'users');
        const snap = await getCountFromServer(coll);
        setMemberCount(snap.data().count);
      } catch {
        /* silent */
      }
    };
    fetchCount();
  }, []);

  return (
    <div className="min-h-screen paper-surface text-ink">
      <Navbar />

      {/* Hero — only place deep navy is allowed as a band surface. */}
      <section className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24 bg-deep text-white topo-wash">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-8">
              <span className="eyebrow text-spark">Who we are</span>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">
                Egypt&apos;s little aerospace<br/>
                <span className="text-spark">powerhouse.</span>
              </h1>
            </div>
            <div className="md:col-span-4 md:text-right">
              <p className="text-white/80 text-[15px] leading-relaxed max-w-md md:ml-auto">
                We&apos;re the only active AIAA student branch in Egypt. We
                sit inside Zewail City and we&apos;d love you to swing by.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-14 md:py-24">
        {/* Zig-zag #1 */}
        <article className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center mb-20 md:mb-32">
          <div className="md:col-span-5 order-2 md:order-1">
            <div className="relative aspect-[4/5] overflow-hidden border border-line photo-natural">
              <Image
                src="/zewail-city-campus.png"
                alt="Zewail City of Science and Technology Campus"
                fill
                sizes="(max-width: 768px) 100vw, 38vw"
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute inset-x-0 bottom-0 p-5 from-ink/70 to-transparent">
                <span className="eyebrow text-white/85">Our home base · Zewail City</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-7 order-1 md:order-2">
            <span className="eyebrow text-ember">Where we work</span>
            <h2 className="mt-2 font-display text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight text-ink">
              A university that treats its curiosity seriously.
            </h2>
            <div className="mt-5 space-y-5 text-[16px] leading-relaxed text-ink-soft max-w-xl">
              <p>
                Zewail City of Science and Technology was built to be Egypt&apos;s
                scientific revival. The Aerospace Engineering department is
                rigorous. Structures, propulsion, control, orbital mechanics.
                That bar is exactly where our members thrive.
              </p>
              <p>
                What we add is the <em className="text-ember font-medium">hands-on layer</em>.
                Your textbook equation becomes a flight-tested airframe, an
                autonomous glider, or the final design of a senior project that
                actually flew.
              </p>
            </div>
          </div>
        </article>

        {/* Principles — three columns of equal voice, varied accents. */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-7 mb-20 md:mb-32">
          {PRINCIPLES.map(p => (
            <article key={p.eyebrow} className="card p-7 md:p-9">
              <span className={`eyebrow ${p.accent}`}>{p.eyebrow}</span>
              <h3
                className="mt-3 font-display text-[1.35rem] font-semibold leading-snug text-ink"
              >
                {p.title}
              </h3>
              <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed">
                {p.body}
              </p>
            </article>
          ))}
        </section>

        {/* Zig-zag #2 — Global AIAA callout, mirror layout. */}
        <section className="canvas-surface p-8 md:p-14 relative overflow-hidden border border-line">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-center">
            <div className="md:col-span-7">
              <span className="eyebrow text-deep">The bigger family</span>
              <h3 className="mt-2 font-display text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight text-ink">
                You&apos;re not joining a club.
                <br/> You&apos;re hopping on a global aerospace network.
              </h3>
              <p className="mt-5 text-[16px] text-ink-soft leading-relaxed max-w-xl">
                AIAA is the world&apos;s largest technical society for aerospace
                — over 30,000 members across 91 countries. Our branch is a
                doorway to that network: conferences, scholarships, mentors,
                and a career portal used by everyone from Boeing PhDs to
                SpaceX new-grads.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="https://www.aiaa.org/about-aiaa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Visit AIAA.org ↗
                </a>
                <Link href="/join" className="btn btn-primary">
                  Join our chapter
                </Link>
              </div>
            </div>
            <div className="md:col-span-5 md:justify-self-end">
              <div className="bg-paper border border-line p-8 md:p-10 max-w-sm">
                <p className="font-display font-semibold text-[clamp(3.5rem,7vw,5rem)] leading-none text-deep tracking-tighter">
                  {memberCount !== null ? memberCount : '—'}
                </p>
                <p className="eyebrow text-ink-muted mt-3">branch members at zewail city</p>
                <p className="mt-5 text-[14px] text-ink-soft leading-relaxed">
                  Each one showed up because they wanted to build something
                  that flies. Your seat is waiting too.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
