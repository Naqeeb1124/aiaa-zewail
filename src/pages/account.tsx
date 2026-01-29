import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function Account() {
  const [user, setUser] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)

  useEffect(() => {
    onAuthStateChanged(auth, u => {
      setUser(u)
      if (u) {
        const fetchApplication = async () => {
          const appRef = doc(db, 'applications', u.uid)
          const appSnap = await getDoc(appRef)
          if (appSnap.exists()) {
            setApplication(appSnap.data())
          }
        }
        fetchApplication()
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="pt-32 md:pt-72 pb-16 md:pb-20 max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-6xl font-black mb-16 text-featured-blue leading-tight uppercase tracking-tighter text-center md:text-left">
          Account <span className="text-zewail-cyan italic">Info</span>
        </h1>
        
        <div className="space-y-12">
            {user && (
            <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-sm border border-slate-100 transition-all hover:shadow-xl group hover:-translate-y-1 duration-500">
                <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-8">
                    <div className="w-16 h-16 bg-featured-blue text-white rounded-full flex items-center justify-center text-2xl font-black shadow-lg">
                        {user.displayName ? user.displayName[0] : 'U'}
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Your Profile</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-12">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Display Name</label>
                        <p className="text-xl font-bold text-slate-700">{user.displayName || 'Not set'}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Email Address</label>
                        <p className="text-xl font-bold text-slate-700">{user.email}</p>
                    </div>
                </div>
            </div>
            )}

            {application && (
            <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-sm border border-slate-100 transition-all hover:shadow-xl group hover:-translate-y-1 duration-500">
                <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-8">
                    <div className="w-16 h-16 bg-featured-green text-white rounded-full flex items-center justify-center text-2xl shadow-lg">
                        📝
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Application</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-y-10 gap-x-12">
                {Object.entries(application).map(([key, value]) => {
                    if (key === 'userId' || key === 'status') return null;
                    return (
                        <div key={key}>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</h3>
                            <p className="text-slate-700 font-bold leading-relaxed">
                                {Array.isArray(value) ? value.join(', ') : String(value)}
                            </p>
                        </div>
                    );
                })}
                </div>
            </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
