import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { Project } from '../../types/project'
import Link from 'next/link'


export default function ProjectArchive() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    const qAll = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(qAll, (snapshot) => {
      const projList = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project))
        .filter(p => p.isArchived) // Only archived projects

      setProjects(projList)
      setLoading(false)
    }, (error) => {
      console.error("Error listening to projects:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 md:pt-72 pb-16 md:pb-32 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-black mb-6 uppercase tracking-widest">
            The History
          </span>
          <h1 className="text-4xl md:text-7xl font-black mb-8 uppercase tracking-tighter leading-tight">
            Mission <span className="text-white/70 italic text-white/90">Archive</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto font-medium">
            Explore the legacy of AIAA Zewail City. A chronicle of our past technical initiatives and research breakthroughs.
          </p>
          
          <div className="mt-10">
            <Link href="/projects" legacyBehavior>
                <a className="text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border border-white/20 hover:bg-white hover:text-slate-900 transition-all">
                    Return to Active Missions
                </a>
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-32">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner">
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">The archives are currently empty.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 opacity-80">
            {projects.map((project) => {
              const plainDescription = project.description.replace(/<[^>]*>?/gm, '');
              const previewText = plainDescription.length > 120 ? `${plainDescription.substring(0, 120)}...` : plainDescription;

              return (
                <div key={project.id} className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 flex flex-col grayscale hover:grayscale-0 transition-all duration-700">
                  <div className="relative h-64 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer" onClick={() => setSelectedProject(project)}>
                    {project.coverImage ? (
                      <>
                        <img src={project.coverImage} alt={project.title} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/20"></div>
                        <div className="relative z-10 text-7xl drop-shadow-lg">
                           {project.icon || '🚀'}
                        </div>
                      </>
                    ) : (
                      <span className="text-9xl">{project.icon || '🚀'}</span>
                    )}
                    <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-sm uppercase tracking-widest border border-white/10 z-20">
                      {project.category}
                    </div>
                  </div>

                  <div className="p-10 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest bg-slate-100 text-slate-500 border-slate-200">
                        Completed
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest bg-amber-100 text-amber-700 border-amber-200">
                        Archived
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight uppercase tracking-tight">
                      {project.title}
                    </h3>

                    <p className="text-slate-500 leading-relaxed mb-6 text-sm font-medium h-20 line-clamp-3">
                      {previewText}
                    </p>

                    <button 
                        onClick={() => setSelectedProject(project)}
                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:gap-3 hover:text-featured-blue transition-all mb-8 w-fit"
                    >
                        View Full Briefing <span className="text-lg">→</span>
                    </button>

                    <div className="mt-auto pt-6 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <div className="flex justify-between items-center">
                          <span>{project.semester}</span>
                          <span>Historical Record</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Project Details Modal */}
        {selectedProject && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProject(null)}>
                <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-[40px] overflow-hidden shadow-2xl flex flex-col animate-scale-up" onClick={e => e.stopPropagation()}>
                    <div className="relative h-48 md:h-64 flex-shrink-0">
                        {selectedProject.coverImage ? (
                            <img src={selectedProject.coverImage} alt={selectedProject.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-7xl">{selectedProject.icon}</div>
                        )}
                        <button 
                            onClick={() => setSelectedProject(null)}
                            className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-featured-blue transition-all"
                        >
                            ✕
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">{selectedProject.title}</h2>
                        </div>
                    </div>
                    
                    <div className="p-8 md:p-12 overflow-y-auto flex-grow custom-scrollbar">
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border border-slate-100 bg-slate-50 text-slate-500 tracking-widest">
                                {selectedProject.category}
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border border-slate-100 bg-slate-50 text-slate-500 tracking-widest">
                                {selectedProject.semester}
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border border-amber-200 bg-amber-50 text-amber-700 tracking-widest">
                                Archived Mission
                            </span>
                        </div>

                        <div 
                            className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                        />
                    </div>

                    <div className="p-8 border-t border-slate-50 bg-slate-50/50 text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            This mission has been completed and moved to technical archives.
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
