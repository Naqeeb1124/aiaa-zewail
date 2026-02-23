import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Image from 'next/image';
import imageLoader from '../lib/imageLoader';
import Link from 'next/link';
import { Project } from '../types/project';

const ProjectCard = ({ project }: { project: Project }) => {
  // Strip HTML tags for preview text
  const plainDescription = project.description.replace(/<[^>]*>?/gm, '');
  const previewText = plainDescription.length > 100 ? `${plainDescription.substring(0, 100)}...` : plainDescription;

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 group">
      <Link href={`/projects`}>
        <div className="relative w-full cursor-pointer overflow-hidden bg-slate-50" style={{ paddingTop: '56.25%' }}>
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              layout="fill"
              objectFit="cover"
              loader={project.coverImage?.includes('cloudinary.com') ? undefined : imageLoader}
              className="group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-700">
              {project.icon || '🚀'}
            </div>
          )}
          <div className="absolute top-4 right-4 z-10">
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-featured-blue text-[8px] font-black uppercase tracking-widest border border-slate-100 shadow-sm">
                {project.category}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-8 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black text-featured-blue uppercase tracking-widest">{project.semester}</span>
            {project.type === 'Flagship' && (
                <span className="px-2 py-0.5 rounded bg-featured-blue text-white text-[8px] font-black uppercase tracking-widest">Flagship</span>
            )}
        </div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 leading-tight group-hover:text-featured-blue transition-colors">{project.title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow font-medium">
          {previewText}
        </p>
        
        <div className="mb-6">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                <span>Progress</span>
                <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-featured-blue h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${project.progress}%` }}></div>
            </div>
        </div>

        <Link href={`/projects`} className="text-featured-green font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:gap-3 transition-all">
          EXPLORE MISSIONS <span className="text-lg">→</span>
        </Link>
      </div>
    </div>
  );
};

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        const fetchedProjects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project));
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Error fetching featured projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section className="py-24 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
                <span className="inline-block px-3 py-1 rounded-full bg-featured-blue/10 text-featured-blue border border-featured-blue/20 text-[10px] font-black mb-4 uppercase tracking-widest">
                    The Workshop
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">
                    Active <span className="text-featured-blue">Missions</span>
                </h2>
            </div>
            <Link href="/projects" legacyBehavior>
                <a className="px-8 py-3 rounded-full border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:border-featured-blue hover:text-featured-blue transition-all">
                    View All Projects
                </a>
            </Link>
        </div>
        
        {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-featured-blue"></div>
            </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Missions are currently in preparation.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProjects;
