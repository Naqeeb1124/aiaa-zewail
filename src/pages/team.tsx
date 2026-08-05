import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Image from 'next/image';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { teamMembers } from '../lib/teamData';

/**
 * Team — human-crafted:
 *   • "Portraits, not posters": real member photos, light shade treatment.
 *   • Honest pattern: role + major in the eyebrow tag, name large.
 *   • No heavy gradient overlay swamping the face.
 *   • Asymmetric 12-col grid with milestone-style "running tally" sidebar
 *     so the section reads as people, not as a credential wall.
 */

const ROLE_ACCENT: Record<string, string> = {
  Chairperson: 'bg-deep text-white border-deep',
  'Vice Chairperson': 'bg-iris-soft text-iris border-iris/30',
};

const TeamMemberCard = ({ member }: { member: typeof teamMembers[number] }) => {
  const accent = ROLE_ACCENT[member.role] || 'bg-canvas-surface text-deep border-line';

  return (
    <article className="card overflow-hidden flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-canvas-surface">
        <Image
          src={member.image}
          alt={`${member.name}, ${member.role}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          className="photo-natural duration-slow ease-human hover:scale-[1.02]"
        />
        {/* Subtle label band so the photo still feels candid. */}
        <span className={`absolute bottom-4 left-4 chip border ${accent}`}>
          {member.role}
        </span>
      </div>
      <div className="p-6">
        <p className="eyebrow text-ink-muted">{member.major}</p>
        <h3 className="mt-2 font-display text-[1.2rem] font-semibold text-ink leading-tight">
          {member.name.trim()}
        </h3>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px]">
          {member.linkedin && member.linkedin !== '#' && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              className="marker-line text-sea font-medium"
            >
              LinkedIn
            </a>
          )}
          {member.link && member.link !== '#' && (
            <a
              href={member.link}
              target="_blank"
              rel="noreferrer"
              className="marker-line text-ember font-medium"
            >
              Portfolio
            </a>
          )}
        </div>
      </div>
    </article>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const docRef = doc(db, 'recruitment', 'status');
    const docSnap = await getDoc(docRef);
    let recruitmentOpen = false;
    if (docSnap.exists()) {
      const data = docSnap.data();
      const now = new Date();
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      recruitmentOpen = data.isOpen && now >= startDate && now <= endDate;
    }
    return { props: { recruitmentOpen } };
  } catch {
    return { props: { recruitmentOpen: false } };
  }
};

export default function Team({ recruitmentOpen }: { recruitmentOpen: boolean }) {
  return (
    <div className="min-h-screen paper-surface text-ink">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-deep text-white topo-wash overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <span className="eyebrow text-spark">The crew</span>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">
                Meet the people<br /><span className="text-spark">behind the launches.</span>
              </h1>
            </div>
            <div className="md:col-span-5 text-white/85 text-[15.5px] leading-relaxed">
              <p>
                Engineers, pilots-in-training, and the kind of student who
                happily spends a Friday night wiring an avionics bay. These
                are the folks carrying the branch this season.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Member grid — asymmetric: 1/3 + 2/3 split could work but we keep it grid with deliberate gutters. */}
      <section className="py-14 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
          </div>

          {/* Closing CTA */}
          {recruitmentOpen ? (
            <section className="mt-20 md:mt-28">
              <div className="card p-10 md:p-16 relative overflow-hidden">
                {/* Big numeral — visual rhythm. */}
                <span
                  aria-hidden
                  className="absolute -top-4 -right-2 md:-right-6 font-display font-semibold text-[10rem] md:text-[14rem] leading-none text-ember/15 select-none"
                >
                  ?
                </span>
                <h2 className="font-display text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight text-ink max-w-xl">
                  Want a portrait here next semester?
                </h2>
                <p className="mt-4 lead">
                  Applications for sub-team leads, content, and outreach are
                  open right now. Bring your weird aerospace idea. We&apos;ll
                  help you scout a crew.
                </p>
                <div className="mt-7">
                  <Link href="/join" className="btn btn-primary">
                    Apply for the next board
                  </Link>
                </div>
              </div>
            </section>
          ) : (
            <section className="mt-20 md:mt-28">
              <div className="canvas-surface border border-line p-10 md:p-14">
                <h2 className="font-display text-[1.5rem] md:text-[1.9rem] font-semibold text-ink">
                  Recruitment is closed for now.
                </h2>
                <p className="mt-3 text-[15.5px] text-ink-soft leading-relaxed max-w-2xl">
                  We open applications at the start of each semester. Follow
                  our Instagram or hop into the Discord to get a nudge when
                  the next window opens.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="https://discord.gg/2xMQrCHdPd"
                    className="btn btn-secondary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Join Discord
                  </Link>
                  <Link href="/" className="marker-line text-deep font-medium">
                    Back home
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
