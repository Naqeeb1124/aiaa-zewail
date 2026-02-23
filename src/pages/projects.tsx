import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import { db, auth } from '../lib/firebase'
import { collection, getDocs, query, orderBy, doc, getDoc, onSnapshot, where } from 'firebase/firestore'
import { createJoinRequest } from '../lib/projects'
import { Project } from '../types/project'
import { UserProfile } from '../types/user'
import Link from 'next/link'
import { useAdmin } from '../hooks/useAdmin'


export default function Projects() {
  const { isAdmin } = useAdmin()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const isOfficialMember = userProfile?.role === 'member' || isAdmin;

  useEffect(() => {
    const qAll = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(qAll, (snapshot) => {
      const projList = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project))
        .filter(p => !p.isArchived) 

      setProjects(projList)
      setLoading(false)
    }, (error) => {
      console.error("Error listening to projects:", error)
      setLoading(false)
    })

    fetchUserProfile()
    return () => unsubscribe()
  }, [])

  const fetchUserProfile = async () => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid)
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile)
          }
        })
        return unsubUser
      } else {
        setUserProfile(null)
      }
    })
    return () => unsubscribe()
  }

  const handleJoin = async (project: Project) => {
    if (!auth.currentUser) {
      alert("Please login to join a project.")
      return
    }

    if (!isOfficialMember) {
      alert("Only official branch members can join projects. Please apply to join the branch first.")
      return
    }

    if (!confirm(`Apply to join ${project.title}?`)) return

    setProcessingId(project.id)
    try {
      await createJoinRequest(project.id, auth.currentUser.uid, project.semester)
      alert("Application submitted! Check your status with an admin.")
      fetchUserProfile()
    } catch (error: any) {
      console.error("Join error:", error)
      alert(error.message)
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Recruiting': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 md:pt-72 pb-16 md:pb-32 bg-featured-blue text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-black mb-6 uppercase tracking-widest">
            The Workshop
          </span>
          <h1 className="text-4xl md:text-7xl font-black mb-8 uppercase tracking-tighter leading-tight">
            Our <span className="text-white/70 italic text-white/90">Projects</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto font-medium">
            From the drafting board to the launchpad. Explore the technical initiatives defining our first season at Zewail City.
          </p>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/projects/archive" legacyBehavior>
                <a className="text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border border-white/20 hover:bg-white hover:text-featured-blue transition-all">
                    View Project Archive
                </a>
            </Link>
            {!isOfficialMember && !loading && (
                <Link href="/join" legacyBehavior>
                    <a className="text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full bg-featured-green text-white hover:bg-white hover:text-featured-green transition-all shadow-lg">
                        Become a Member to Join
                    </a>
                </Link>
            )}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-32">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-featured-blue"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200">
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active missions at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {projects.map((project) => {
              const applicationStatus = userProfile?.projectHistory?.find(p => p.projectId === project.id)?.status;
              const plainDescription = project.description.replace(/<[^>]*>?/gm, '');
              const previewText = plainDescription.length > 120 ? `${plainDescription.substring(0, 120)}...` : plainDescription;

              return (
                <div key={project.id} className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all duration-500 group hover:-translate-y-2">
                  <div className="relative h-64 overflow-hidden bg-slate-50 flex items-center justify-center cursor-pointer" onClick={() => setSelectedProject(project)}>
                    {project.coverImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={project.coverImage} alt={project.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>
                        <div className="relative z-10 text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-700">
                           {project.icon || '🚀'}
                        </div>
                      </>
                    ) : (
                      <span className="text-9xl group-hover:scale-110 transition-transform duration-700">{project.icon || '🚀'}</span>
                    )}
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-featured-blue shadow-sm uppercase tracking-widest border border-slate-50 z-20">
                      {project.category}
                    </div>
                  </div>

                  <div className="p-10 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      {applicationStatus && (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${
                          applicationStatus === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                          applicationStatus === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {applicationStatus === 'accepted' ? 'Joined' : applicationStatus}
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-featured-blue transition-colors leading-tight uppercase tracking-tight">
                      {project.title}
                    </h3>

                    <p className="text-slate-500 leading-relaxed mb-6 text-sm font-medium h-20 line-clamp-3">
                      {previewText}
                    </p>

                    <button 
                        onClick={() => setSelectedProject(project)}
                        className="text-[10px] font-black text-featured-blue uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all mb-8 w-fit"
                    >
                        Read Mission Briefing <span className="text-lg">→</span>
                    </button>

                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div>
                          <div className="mb-2">Capacity</div>
                          <div className="text-sm font-bold text-slate-700">
                            {project.currentSeats || 0} / {project.maxSeats || '∞'} 
                          </div>
                        </div>
                        {project.type === 'Flagship' && (
                          <span className="bg-featured-blue/10 text-featured-blue px-3 py-1 rounded-full border border-featured-blue/20">
                            Flagship
                          </span>
                        )}
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-8">
                        <div className="bg-featured-blue h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${project.progress || 0}%` }}></div>
                      </div>

                      <button
                        onClick={() => handleJoin(project)}
                        disabled={
                          userProfile === null || 
                          processingId === project.id ||
                          applicationStatus !== undefined || // Already applied
                          project.status !== 'Recruiting' ||
                          (project.maxSeats > 0 && project.currentSeats >= project.maxSeats) ||
                          !isOfficialMember // Must be a member
                        }
                        className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 
                          ${applicationStatus === 'accepted' ? 'bg-green-500 text-white border-green-500' : 
                            applicationStatus === 'rejected' ? 'bg-red-500 text-white border-red-500' :
                            applicationStatus === 'pending' ? 'bg-amber-500 text-white border-amber-500' :
                            !isOfficialMember ? 'bg-slate-200 text-slate-400 border-slate-300' :
                            'bg-featured-blue text-white hover:bg-featured-green border-transparent shadow-lg hover:shadow-featured-green/20'} 
                          disabled:bg-slate-100 disabled:text-slate-400 transform hover:-translate-y-0.5`}
                      >
                        {processingId === project.id ? 'Processing...' :
                          applicationStatus === 'accepted' ? 'Active Member' :
                          applicationStatus === 'rejected' ? 'Application Closed' :
                          applicationStatus === 'pending' ? 'Review Pending' :
                          !isOfficialMember ? 'Membership Required' :
                          project.status !== 'Recruiting' ? 'Not Recruiting' :
                          (project.maxSeats > 0 && project.currentSeats >= project.maxSeats) ? 'Capacity Reached' :
                          'Join Project'}
                      </button>
                      {!auth.currentUser && (
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-slate-400 mt-4">Account Required</p>
                      )}
                      {auth.currentUser && !isOfficialMember && (
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-slate-400 mt-4 underline decoration-featured-green decoration-2">Official Membership Required</p>
                      )}
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
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest ${getStatusColor(selectedProject.status)}`}>
                                {selectedProject.status}
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border border-slate-100 bg-slate-50 text-slate-500 tracking-widest">
                                {selectedProject.category}
                            </span>
                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border border-slate-100 bg-slate-50 text-slate-500 tracking-widest">
                                {selectedProject.semester}
                            </span>
                        </div>

                        <div 
                            className="prose prose-slate max-w-none text-slate-600 font-medium leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: selectedProject.description }}
                        />
                    </div>

                    <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Progress: {selectedProject.progress}%
                        </div>
                        <button 
                            onClick={() => { handleJoin(selectedProject); setSelectedProject(null); }}
                            disabled={!isOfficialMember}
                            className="px-8 py-3 bg-featured-blue text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-featured-green transition-all disabled:bg-slate-200 disabled:text-slate-400"
                        >
                            {isOfficialMember ? 'Apply to Join' : 'Membership Required'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Technical Call to Action */}
        <div className="mt-20 bg-featured-blue rounded-[40px] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Have a Project Idea?</h2>
            <p className="text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed text-lg font-medium">
              We provide the resources, mentorship, and community to turn your aerospace concepts into reality. Our project proposals are always open for members.
            </p>
            <Link href="/contact" legacyBehavior>
              <a className="inline-block px-10 py-4 rounded-full bg-featured-green text-white font-bold text-lg hover:bg-white hover:text-featured-blue transition-all shadow-xl transform hover:-translate-y-0.5">
                Pitch Your Idea
              </a>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}