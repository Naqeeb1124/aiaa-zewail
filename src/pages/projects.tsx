import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import {
  collection, getDocs, query, orderBy, doc, getDoc, onSnapshot,
} from 'firebase/firestore';
import { createJoinRequest } from '../lib/projects';
import { Project } from '../types/project';
import { UserProfile } from '../types/user';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '../hooks/useAdmin';
import { useRouter } from 'next/router';
import { signInWithGoogle } from '../lib/auth';
import imageLoader from '../lib/imageLoader';

/**
 * Projects — human-crafted:
 *   • Magazine-style grid: the flagship project anchors the page on the
 *     left (8 cols x full-bleed-ish); the rest live in a 4-col cadence.
 *   • Semantic chips (recruiting / in-progress / completed) rather than
 *     the previous color-jumble.
 *   • Storytelling focus: each card tells a tiny story of "what we did".
 *   • Off-black body; warm-primary CTA for join action.
 */

const statusChip = (status?: string) => {
  switch (status) {
    case 'Completed':   return 'chip chip-completed';
    case 'In Progress': return 'chip chip-progress';
    case 'Recruiting':  return 'chip chip-recruiting';
    default:            return 'chip chip-neutral';
  }
};

const progressColor = (status?: string) => {
  switch (status) {
    case 'Completed':   return 'bg-growth';
    case 'Recruiting':  return 'bg-ember';
    default:            return 'bg-deep';
  }
};

const applicationChip = (status?: string) => {
  switch (status) {
    case 'accepted': return 'chip chip-completed';
    case 'rejected': return 'chip chip-recruiting';
    case 'pending':  return 'chip chip-progress';
    default:         return null;
  }
};

export default function Projects() {
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const isOfficialMember = userProfile?.role === 'member' || isAdmin;

  useEffect(() => {
    const qAll = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubProjects = onSnapshot(qAll, (snap) => {
      const projList = snap.docs
        .map(d => ({ id: d.id, ...(d.data() as Omit<Project, 'id'>) } as Project))
        .filter(p => !p.isArchived);
      setProjects(projList);
      setLoading(false);
    }, () => setLoading(false));

    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) setUserProfile(docSnap.data() as UserProfile);
        });
        return unsubUser;
      } else {
        setUserProfile(null);
      }
    });

    return () => { unsubProjects(); unsubAuth(); };
  }, []);

  const handleJoin = async (project: Project) => {
    const currentPath = router.asPath;
    if (!auth.currentUser) {
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error('Login failed:', err);
        return;
      }
    }
    if (!isOfficialMember) {
      router.push(`/join?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    if (!confirm(`Apply to join ${project.title}?`)) return;
    if (!auth.currentUser) return;

    setProcessingId(project.id);
    try {
      await createJoinRequest(project.id, auth.currentUser.uid, project.semester);
      alert('Application submitted! Check your status with an admin.');
    } catch (error: any) {
      console.error('Join error:', error);
      alert(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const flagship = projects.find(p => p.type === 'Flagship') || projects[0];
  const rest     = projects.filter(p => p.id !== flagship?.id);

  return (
    <div className="min-h-screen paper-surface text-ink">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-deep text-white topo-wash overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <span className="eyebrow text-spark">The workshop</span>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">
                Projects in flight<br /><span className="text-spark">right now.</span>
              </h1>
            </div>
            <div className="md:col-span-5 text-white/85 text-[15.5px] leading-relaxed">
              <p>
                Each project here is owned and built by members. Some are
                flight-ready this semester; others are in the messy early
                phase where things always go wrong. Either way, you&apos;re
                welcome to dig in.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/projects/archive" className="marker-line text-spark font-medium">
                  Past archives
                </Link>
                {!isOfficialMember && !loading && (
                  <Link href="/join" className="btn btn-primary">
                    Become a member
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-14 md:py-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="inline-block w-10 h-10 border-2 border-line border-t-deep animate-orbit" />
          </div>
        ) : projects.length === 0 ? (
          <section className="text-center py-20 card border-dashed">
            <h2 className="font-display text-[1.5rem] font-semibold text-ink">
              No active missions yet.
            </h2>
            <p className="lead mt-3 mx-auto max-w-md">
              Our first round of proposals opens soon. Or pitch us one via{' '}
              <Link href="/contact" className="marker-line text-deep">the contact page</Link>.
            </p>
          </section>
        ) : (
          <>
            {/* Flagship section (asymmetric, 8-col anchors, 4-col side facts) */}
            {flagship && (
              <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-7 mb-8 md:mb-12">
                <FlagshipCard project={flagship} onOpen={() => setSelectedProject(flagship)} onJoin={handleJoin} />
                <SideFacts project={flagship} />
              </section>
            )}

            {/* Magazine grid */}
            {rest.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
                {rest.map(project => (
                  <ProjectTile
                    key={project.id}
                    project={project}
                    onOpen={() => setSelectedProject(project)}
                    onJoin={() => handleJoin(project)}
                    processing={processingId === project.id}
                    userProfile={userProfile}
                    isOfficialMember={isOfficialMember}
                  />
                ))}
              </section>
            )}

            {/* Pitch CTA */}
            <section className="mt-16 md:mt-24 paper-surface border border-line p-8 md:p-14 relative overflow-hidden">
              <div className="grid md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-8">
                  <span className="eyebrow text-deep">Have an idea?</span>
                  <h3 className="mt-2 font-display text-[clamp(1.5rem,3vw,2.2rem)] font-semibold leading-tight text-ink">
                    Pitch us your aerospace project.
                  </h3>
                  <p className="mt-3 text-[15.5px] text-ink-soft leading-relaxed max-w-xl">
                    We help with space, mentorship, and budget. Bring a one-page
                    pitch. We&apos;ll meet you within a week.
                  </p>
                </div>
                <div className="md:col-span-4 md:text-right">
                  <Link href="/contact" className="btn btn-primary">
                    Pitch an idea
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Details modal */}
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onJoin={() => { handleJoin(selectedProject); setSelectedProject(null); }}
            isOfficialMember={isOfficialMember}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ---------------- Subcomponents ---------------- */

function FlagshipCard({
  project, onOpen, onJoin,
}: { project: Project; onOpen: () => void; onJoin: (p: Project) => void }) {
  return (
    <article className="card overflow-hidden md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-0">
      <button
        onClick={onOpen}
        className="relative aspect-[4/3] md:aspect-auto md:h-full w-full bg-canvas-surface text-left"
        style={{ minHeight: '260px' }}
      >
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            style={{ objectFit: 'cover' }}
            loader={imageLoader}
            className="photo-natural"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-7xl text-ink-muted">
            {project.icon || ' '}
          </div>
        )}
        <span className="absolute top-5 left-5 chip chip-flagship">Flagship</span>
      </button>
      <div className="p-8 md:p-12 flex flex-col justify-center">
        <p className="eyebrow text-ember">This semester&apos;s flagship</p>
        <h3 className="mt-3 font-display text-[clamp(1.7rem,3vw,2.3rem)] font-semibold leading-tight text-ink">
          {project.title}
        </h3>
        <p className="mt-4 text-[15.5px] text-ink-soft leading-relaxed line-clamp-4">
          {(project.description || '').replace(/<[^>]*>?/gm, '')}
        </p>

        <div className="mt-6">
          <div className="flex justify-between items-baseline text-[11px] eyebrow text-ink-muted">
            <span className={statusChip(project.status).split(' ')[1]}>{project.status}</span>
            <span>{project.progress ?? 0}% complete</span>
          </div>
          <div className="mt-2 w-full bg-canvas-surface h-1.5 overflow-hidden">
            <div
              className={`${progressColor(project.status)} h-1.5 duration-1000 ease-human`}
              style={{ width: `${project.progress ?? 0}%` }}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button onClick={onOpen} className="btn btn-secondary">Read the briefing</button>
          <button onClick={() => onJoin(project)} className="btn btn-primary">Join this project</button>
        </div>
      </div>
    </article>
  );
}

function SideFacts({ project }: { project: Project }) {
  return (
    <aside className="md:col-span-4 card p-8">
      <span className="eyebrow text-deep">Quick facts</span>
      <ul className="mt-4 space-y-4 text-[14.5px]">
        <FactRow label="Category" value={project.category} />
        <FactRow label="Semester" value={project.semester} />
        <FactRow
          label="Team capacity"
          value={`${project.currentSeats || 0} / ${project.maxSeats || '∞'}`}
        />
        <FactRow
          label="Status"
          value={project.status || 'Planning'}
        />
      </ul>
      <p className="mt-6 text-[13px] text-ink-muted leading-relaxed">
        Flagships are the projects we&apos;re putting real weight behind: bigger
        budget mentorship, more demo opportunities, and a higher bar for what
        we ship.
      </p>
    </aside>
  );
}

function FactRow({ label, value }: { label: string; value?: string }) {
  return (
    <li className="flex justify-between items-baseline border-b border-line pb-3 last:border-0">
      <span className="eyebrow text-ink-muted">{label}</span>
      <span className="text-ink font-medium">{value || '—'}</span>
    </li>
  );
}

function ProjectTile({
  project, onOpen, onJoin, processing, userProfile, isOfficialMember,
}: {
  project: Project;
  onOpen: () => void;
  onJoin: () => void;
  processing: boolean;
  userProfile: UserProfile | null;
  isOfficialMember: boolean;
}) {
  const applicationStatus = userProfile?.projectHistory?.find(p => p.projectId === project.id)?.status;
  const plain = (project.description || '').replace(/<[^>]*>?/gm, '');
  const preview = plain.length > 110 ? `${plain.substring(0, 110)}[..]` : plain;
  const aChip = applicationChip(applicationStatus);

  const buttonText =
    processing ? 'Working on it[..]'
    : applicationStatus === 'accepted' ? 'You&apos;re in'
    : applicationStatus === 'rejected' ? 'Closed'
    : applicationStatus === 'pending' ? 'Review pending'
    : !isOfficialMember ? 'Join the branch first'
    : project.status !== 'Recruiting' ? 'Not recruiting'
    : (project.maxSeats > 0 && project.currentSeats >= project.maxSeats) ? 'Full'
    : 'Join this project';

  return (
    <article className="card overflow-hidden flex flex-col">
      <button
        onClick={onOpen}
        className="relative aspect-[16/10] w-full bg-canvas-surface text-left"
      >
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
            loader={imageLoader}
            className="photo-natural"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl text-ink-muted">
            {project.icon || ' '}
          </div>
        )}
        <span className={`absolute top-4 left-4 ${statusChip(project.status)}`}>
          {project.status}
        </span>
        {aChip && (
          <span className={`absolute top-4 right-4 ${aChip}`}>
            {applicationStatus}
          </span>
        )}
      </button>
      <div className="p-6 flex flex-col flex-grow">
        <p className="eyebrow text-ink-muted">{project.category} · {project.semester}</p>
        <h4 className="mt-2 font-display font-semibold text-[1.2rem] leading-snug text-ink">
          {project.title}
        </h4>
        <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed flex-grow">
          {preview}
        </p>
        <div className="mt-6">
          <div className="w-full bg-canvas-surface h-1 overflow-hidden">
            <div
              className={`${progressColor(project.status)} h-1 duration-1000 ease-human`}
              style={{ width: `${project.progress ?? 0}%` }}
            />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button onClick={onOpen} className="marker-line text-[13px] font-display font-semibold text-ink">
            Read briefing
          </button>
          <button onClick={onJoin} className="btn btn-primary py-2 px-4 text-[12px]">
            {buttonText}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProjectModal({ project, onClose, onJoin, isOfficialMember }: {
  project: Project;
  onClose: () => void;
  onJoin: () => void;
  isOfficialMember: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink/85 animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-paper w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-scale-up border border-line"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 md:h-64 flex-shrink-0">
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              loader={imageLoader}
              className="photo-natural"
            />
          ) : (
            <div className="w-full h-full bg-canvas-surface flex items-center justify-center text-7xl text-ink-muted">
              {project.icon}
            </div>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 w-10 h-10 bg-paper/85 flex items-center justify-center text-ink hover:bg-deep hover:text-white duration-base ease-human"
          >
            [X]
          </button>
          <div className="absolute bottom-0 inset-x-0 p-6 from-ink/65 to-transparent">
            <h3 className="font-display text-[1.6rem] md:text-[2rem] font-semibold leading-tight text-white">
              {project.title}
            </h3>
          </div>
        </div>

        <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar flex-grow">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className={statusChip(project.status)}>{project.status}</span>
            <span className="chip chip-neutral">{project.category}</span>
            <span className="chip chip-neutral">{project.semester}</span>
          </div>

          <div className="whitespace-pre-wrap text-ink-soft leading-relaxed">
            {(project.description || '').replace(/<[^>]*>?/gm, '')}
          </div>
        </div>

        <div className="p-6 border-t border-line bg-canvas-surface flex justify-between items-center gap-4">
          <p className="eyebrow text-ink-muted">
            Progress {project.progress ?? 0}%
          </p>
          <button onClick={onJoin} className="btn btn-primary">
            {isOfficialMember ? 'Apply to join' : 'Become a member first'}
          </button>
        </div>
      </div>
    </div>
  );
}
