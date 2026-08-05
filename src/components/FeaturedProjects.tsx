import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Image from 'next/image';
import imageLoader from '../lib/imageLoader';
import Link from 'next/link';
import { Project } from '../types/project';

/**
 * FeaturedProjects — human-crafted:
 *   • Asymmetric card layout: one chip + one progress arc, no
 *     "everything is feature-blue slop".
 *   • Progress bar colour follows state (growth for completed,
 *     ember for in-progress, deep for recruiting/cold).
 *   • Off-black body copy.
 */

const ProjectCard = ({ project }: { project: Project }) => {
  const plain = (project.description || '').replace(/<[^>]*>?/gm, '');
  const preview = plain.length > 110 ? `${plain.substring(0, 110)}[..]` : plain;

  const statusClass =
    project.status === 'Completed'   ? 'chip chip-completed'
  : project.status === 'In Progress' ? 'chip chip-progress'
  : project.status === 'Recruiting'  ? 'chip chip-recruiting'
  :                                    'chip chip-neutral';

  const progressColor =
    project.status === 'Completed'   ? 'bg-growth'
  : project.status === 'Recruiting'  ? 'bg-ember'
  :                                    'bg-deep';

  return (
    <article className="card overflow-hidden flex flex-col">
      <Link href="/projects" className="group block relative w-full bg-canvas-surface" style={{ paddingTop: '58%' }}>
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: 'cover' }}
            loader={project.coverImage?.includes('cloudinary.com') ? undefined : imageLoader}
            className="photo-natural duration-slow ease-human group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl text-ink-muted">
            {project.icon || ' '}
          </div>
        )}
        <span className="absolute top-4 left-4 chip chip-neutral z-10">
          {project.category}
        </span>
        {project.type === 'Flagship' && (
          <span className="absolute top-4 right-4 chip chip-flagship z-10">
            Flagship
          </span>
        )}
      </Link>
      <div className="p-7 flex-grow flex flex-col">
        <p className="eyebrow text-ink-muted">{project.semester}</p>
        <h3 className="mt-2 font-display font-semibold text-[1.25rem] leading-snug text-ink">
          {project.title}
        </h3>
        <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed flex-grow">
          {preview}
        </p>

        <div className="mt-5">
          <div className="flex justify-between items-baseline text-[11px] eyebrow text-ink-muted">
            <span>{project.status || 'Planning'}</span>
            <span>{project.progress ?? 0}%</span>
          </div>
          <div className="mt-2 w-full bg-canvas-surface h-1.5 overflow-hidden">
            <div
              className={`${progressColor} h-1.5 duration-1000 ease-human`}
              style={{ width: `${project.progress ?? 0}%` }}
            />
          </div>
        </div>

        <Link
          href="/projects"
          className="mt-6 marker-line text-[13px] font-display font-semibold text-ink self-start"
        >
          Read the mission briefing
        </Link>
      </div>
    </article>
  );
};

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(10));
        const snap = await getDocs(q);
        const items = snap.docs
          .map(doc => ({ id: doc.id, ...(doc.data() as Omit<Project, 'id'>) } as Project))
          .filter(p => !p.isArchived)
          .slice(0, 3);
        setProjects(items);
      } catch (err) {
        console.error('Error fetching featured projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading || projects.length === 0) return null;

  return (
    <section className="canvas-surface py-20 md:py-28 border-y border-line">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-6">
          <div className="max-w-xl">
            <span className="eyebrow text-deep">Active missions</span>
            <h2 className="mt-2 font-display text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight text-ink">
              The projects we&apos;re shipping this semester.
            </h2>
            <p className="lead mt-3">
              Real builds. Real failures. Real &ldquo;oops, that broke&rdquo;
              debriefs. Open to members who want to build alongside us.
            </p>
          </div>
          <Link
            href="/projects"
            className="btn btn-secondary self-start md:self-auto"
          >
            All projects
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
