import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAdmin } from '../hooks/useAdmin'

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/join')
    if (!loading && user && !isAdmin) router.push('/dashboard')
  }, [user, isAdmin, loading, router])

  if (loading || !user || !isAdmin) return (
// ... rest of the component ...
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-featured-blue font-bold text-xl">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-featured-blue border-t-transparent rounded-full animate-spin"></div>
            Verifying Admin Privileges...
        </div>
    </div>
  )

  const ADMIN_MODULES = [
    { 
        title: "Recruitment Center", 
        desc: "Manage applications, interview schedules, and recruitment status.",
        icon: "👥",
        link: "/admin/recruitment",
        color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    { 
        title: "Applications", 
        desc: "Review and grade incoming membership applications.",
        icon: "📝",
        link: "/admin/applications",
        color: "bg-purple-50 text-purple-600 border-purple-100"
    },
    { 
        title: "Interviews", 
        desc: "Manage interview slots and see upcoming appointments.",
        icon: "📅",
        link: "/admin/interviews",
        color: "bg-amber-50 text-amber-600 border-amber-100"
    },
    { 
        title: "Communications", 
        desc: "Send personalized bulk emails to members and event attendees.",
        icon: "📧",
        link: "/admin/communications",
        color: "bg-indigo-50 text-indigo-600 border-indigo-100"
    },
    { 
        title: "Contact Inbox", 
        desc: "View and reply to contact requests from the website.",
        icon: "📨",
        link: "/admin/inbox",
        color: "bg-teal-50 text-teal-600 border-teal-100"
    },
    { 
        title: "Member Database", 
        desc: "View active members, update roles, and manage points.",
        icon: "users",
        link: "/admin/members",
        color: "bg-emerald-50 text-emerald-600 border-emerald-100"
    },
    { 
        title: "Account Directory", 
        desc: "View everyone who has signed in to the platform.",
        icon: "👤",
        link: "/admin/users",
        color: "bg-slate-100 text-slate-600 border-slate-200"
    },
    { 
        title: "Event Manager", 
        desc: "Create new events, track attendance, and publish recaps.",
        icon: "🎉",
        link: "/admin/events",
        color: "bg-pink-50 text-pink-600 border-pink-100"
    },
    { 
        title: "Announcements", 
        desc: "Post news and updates to the website homepage.",
        icon: "📢",
        link: "/admin/announcements",
        color: "bg-cyan-50 text-cyan-600 border-cyan-100"
    },
    { 
        title: "Projects", 
        desc: "Oversee active projects and assign leads.",
        icon: "🚀",
        link: "/admin/projects",
        color: "bg-indigo-50 text-indigo-600 border-indigo-100"
    },
    { 
        title: "Join Requests", 
        desc: "Approve or reject members applying for projects.",
        icon: "📮",
        link: "/admin/requests",
        color: "bg-orange-50 text-orange-600 border-orange-100"
    },
    { 
        title: "Opportunities", 
        desc: "Post internships, competitions, and research openings.",
        icon: "💼",
        link: "/admin/opportunities",
        color: "bg-amber-50 text-amber-600 border-amber-100"
    },
    { 
        title: "Certificates", 
        desc: "Generate and distribute participation certificates.",
        icon: "🏅",
        link: "/admin/certificates",
        color: "bg-slate-50 text-slate-600 border-slate-100"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold mb-2">Admin Portal</h1>
                    <p className="text-slate-400">Welcome back, {user.displayName}. System is operational.</p>
                </div>
                <div className="hidden md:block text-right">
                    <div className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-1">Status</div>
                    <div className="flex items-center justify-end gap-2">
                        <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="font-mono text-slate-300">ONLINE</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ADMIN_MODULES.map((mod, idx) => (
                <Link 
                  key={idx} 
                  href={mod.link}
                  className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col active:scale-[0.98]"
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${mod.color}`}>
                        {mod.icon === 'users' ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : mod.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-featured-blue transition-colors">{mod.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{mod.desc}</p>
                    
                    <div className="mt-auto pt-6 flex items-center text-sm font-bold text-slate-400 group-hover:text-featured-blue transition-colors">
                        Access Module <span className="ml-2">→</span>
                    </div>
                </Link>
            ))}
        </div>
      </main>
      
      <Footer />
    </div>
  )
}