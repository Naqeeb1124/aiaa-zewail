import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import { db, auth } from '../lib/firebase'
import { collection, getDocs, query, orderBy, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { createJoinRequest } from '../lib/projects'
import { Project } from '../types/project'
import { UserProfile } from '../types/user'


export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project))
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
        // Also listen to user profile changes (for realtime joined status)
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile)
          }
        })
        // Cleanup user listener when auth changes? 
        // Ideally we save unsubUser to state but for simplicity lets just fetch once or listen. 
        // Listening is better for "Seat is NOT consumed until accepted" -> "Once accepted... User becomes active". 
        // So if admin accepts, user UI updates immediately.
        return unsubUser
      } else {
        setUserProfile(null)
      }
    })
    // Note: This auth listener cleanup is slightly tricky with the inner snapshot listener.
    // For now, simpler implementation:
    return () => unsubscribe()
  }

  const handleJoin = async (project: Project) => {
    if (!auth.currentUser) {
      alert("Please login to join a project.")
      return
    }

    if (!confirm(`Apply to join ${project.title}?`)) return

    setProcessingId(project.id)
    try {
      await createJoinRequest(project.id, auth.currentUser.uid, project.semester)
      alert("Application submitted! Check your status with an admin.")
      // Refresh user profile to get latest history if we want to update UI immediately
      // but for now, just alert is fine.

      // Optimistically update or re-fetch?
      // Re-fetch logic would be safest to sync state
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
              
              return (
                <div key={project.id} className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all duration-500 group hover:-translate-y-2">
                  <div className="relative h-64 overflow-hidden bg-slate-50 flex items-center justify-center text-9xl">
                    <span className="group-hover:scale-110 transition-transform duration-700">{project.icon || '🚀'}</span>
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-black text-featured-blue shadow-sm uppercase tracking-widest border border-slate-50">
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

                    <p className="text-slate-500 leading-relaxed mb-8 flex-grow whitespace-pre-line text-sm font-medium">
                      {project.description}
                    </p>

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
                          (project.maxSeats > 0 && project.currentSeats >= project.maxSeats)
                        }
                        className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 
                          ${applicationStatus === 'accepted' ? 'bg-green-500 text-white border-green-500' : 
                            applicationStatus === 'rejected' ? 'bg-red-500 text-white border-red-500' :
                            applicationStatus === 'pending' ? 'bg-amber-500 text-white border-amber-500' :
                            'bg-featured-blue text-white hover:bg-featured-green border-transparent shadow-lg hover:shadow-featured-green/20'} 
                          disabled:bg-slate-100 disabled:text-slate-400 transform hover:-translate-y-0.5`}
                      >
                        {processingId === project.id ? 'Processing...' :
                          applicationStatus === 'accepted' ? 'Active Member' :
                          applicationStatus === 'rejected' ? 'Application Closed' :
                          applicationStatus === 'pending' ? 'Review Pending' :
                          project.status !== 'Recruiting' ? 'Not Recruiting' :
                          (project.maxSeats > 0 && project.currentSeats >= project.maxSeats) ? 'Capacity Reached' :
                          'Join Project'}
                      </button>
                      {!auth.currentUser && (
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center text-slate-400 mt-4">Account Required</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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