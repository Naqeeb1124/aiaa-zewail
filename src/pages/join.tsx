import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'
import {signInWithGoogle} from '../lib/auth'
import {useState, useEffect, useMemo} from 'react'
import {auth, db} from '../lib/firebase'
import {onAuthStateChanged} from 'firebase/auth'
import {useRouter} from 'next/router'
import {doc, getDoc, setDoc, updateDoc, onSnapshot} from 'firebase/firestore'
import ApplicationForm from '../components/ApplicationForm';
import { useAdmin } from '../hooks/useAdmin'
import { getAdminEmails } from '../lib/admin'

import {GetServerSideProps} from 'next'

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const statusRef = doc(db, "recruitment", "status");
    const statusDoc = await getDoc(statusRef);
    const open = statusDoc.exists() ? statusDoc.data().open : false;

    return {
      props: {
        initialRecruitmentOpen: !!open
      }
    }
  } catch (error) {
    console.error("Error in getServerSideProps for /join:", error);
    return {
      props: {
        initialRecruitmentOpen: false
      }
    }
  }
}

export default function Join({initialRecruitmentOpen}: {initialRecruitmentOpen: boolean}) {
  const { user, isAdmin, loading } = useAdmin()
  const router = useRouter()
  const [applicationStatus, setApplicationStatus] = useState<'loading' | 'not_applied' | 'applied' | 'accepted' | 'rejected'>('loading')
  const [recruitmentOpen, setRecruitmentOpen] = useState(initialRecruitmentOpen)
  const [interview, setInterview] = useState<any>(null)
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [testMode, setTestMode] = useState(false)

  useEffect(() => {
    // Handle redirect if user is logged in
    if (user && router.query.redirect) {
      router.push(router.query.redirect as string);
      return;
    }

    // Listen for recruitment status
    const unsubStatus = onSnapshot(doc(db, "recruitment", "status"), (doc) => {
      if (doc.exists()) {
        setRecruitmentOpen(doc.data().open)
      }
    })

    if (user && !isAdmin) {
      // Listen for application status
      const unsubApp = onSnapshot(doc(db, "applications", user.uid), (doc) => {
        if (doc.exists()) {
          const status = doc.data().status || 'applied'
          setApplicationStatus(status)
        } else {
          setApplicationStatus('not_applied')
        }
      })

      // Listen for interview data
      const unsubInterview = onSnapshot(doc(db, "interviews", user.uid), (doc) => {
        if (doc.exists()) {
          setInterview({ id: doc.id, ...doc.data() })
        } else {
          setInterview(null)
        }
      })

      return () => {
        unsubStatus()
        unsubApp()
        unsubInterview()
      }
    } else {
      if (!loading && !user) setApplicationStatus('not_applied')
      return () => unsubStatus()
    }
  }, [user, isAdmin, loading, router])

  const handleConfirmSlot = async () => {
    if (!selectedSlot || !user) {
      alert('Please select a time slot.')
      return
    }

    try {
        const interviewRef = doc(db, 'interviews', user.uid)
        await updateDoc(interviewRef, {
          selectedSlot: selectedSlot.time,
          location: selectedSlot.location,
          status: 'scheduled',
        })

        const subject = `Interview Scheduled for Your AIAA Zewail City Application`;
        const text = `Dear applicant,\n\nYour interview has been scheduled for ${new Date(selectedSlot.time).toLocaleString()} at ${selectedSlot.location}.\n\nBest regards,\nAIAA Zewail City Team`;

        const token = await user.getIdToken()

        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            to: user.email || '',
            subject,
            text,
          }),
        });

        // Notify all admins
        const adminEmails = await getAdminEmails();
        await Promise.all(adminEmails.map(email => 
          fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              to: email,
              subject: `Interview Scheduled with ${user.displayName}`,
              text: `${user.displayName} has scheduled their interview for ${new Date(selectedSlot.time).toLocaleString()} at ${selectedSlot.location}.`,
            }),
          })
        ));

        alert('Interview slot confirmed!')
        setInterview({ ...interview, status: 'scheduled', selectedSlot: selectedSlot.time, location: selectedSlot.location })
    } catch (error) {
        console.error("Error confirming slot:", error)
        alert("Failed to confirm slot.")
    }
  }

  const handleApplicationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return;

    const formData = new FormData(e.currentTarget)
    
    try {
        const token = await user.getIdToken()

        // NEW REVAMPED DATA STRUCTURE
        const data = {
          // Section 1: Basic Info
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          major: formData.get('major'),
          year: formData.get('year'),
          previous_clubs: formData.get('previous_clubs'),

          // Section 2: Commitment Filter
          hours_per_week: formData.get('hours_per_week'),
          weekly_meetings: formData.get('weekly_meetings'),
          semester_commitment: formData.get('semester_commitment'),
          other_clubs: formData.get('other_clubs'),

          // Section 3: Skills & Interests
          interests: Array.from(formData.getAll('interests')),
          tools: formData.get('tools'),

          // Section 4: One Smart Question
          impact_vision: formData.get('impact_vision'),

          // Metadata
          applicationType: 'interview', 
          status: 'pending',
          createdAt: new Date().toISOString()
        }

        // 1. Save Application
        await setDoc(doc(db, "applications", user.uid), data)
        
        // 2. Update User Profile (using setDoc with merge to avoid non-existent doc errors)
        await setDoc(doc(db, "users", user.uid), {
            phone: data.phone,
            major: data.major,
            year: data.year,
            lastUpdated: new Date().toISOString()
        }, { merge: true })

        // 3. Update Status for UI
        setApplicationStatus('applied')
        if (testMode) {
            alert("Test Submission Successful! Data has been recorded.");
        }
    } catch (error: any) {
        console.error("Submission error:", error)
        alert(`Failed to submit: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-72 pb-16 md:pb-20 bg-featured-blue text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase tracking-tighter">
            Join the <span className="text-white/70 italic">Mission</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium">
            Become a part of the world&apos;s largest aerospace professional society at Zewail City.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="bg-white rounded-[40px] shadow-xl p-8 md:p-16 border border-slate-100">
          {!user && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-50 text-featured-blue rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-blue-100">👤</div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Registration</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto font-medium">Please sign in with your Zewail City Google account to register as a member and access the application form.</p>
              <button 
                className="px-10 py-4 rounded-full bg-featured-blue text-white font-black text-lg hover:bg-featured-green transition-all shadow-xl hover:shadow-featured-blue/30 flex items-center justify-center gap-3 mx-auto transform hover:-translate-y-0.5 uppercase tracking-widest" 
                onClick={signInWithGoogle}
              >
                Sign in with Google
              </button>
            </div>
          )}

          {user && isAdmin && applicationStatus !== 'applied' && (
            <div className="text-center py-12">
               <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-amber-100">🛡️</div>
               <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Admin Account</h2>
               <p className="text-slate-500 font-medium">You are logged in as an administrator. You do not need to submit a membership application.</p>
               
               {!testMode ? (
                 <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <Link href="/admin" legacyBehavior>
                        <a className="px-10 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-sm hover:bg-featured-blue transition-all shadow-xl transform hover:-translate-y-0.5">
                            Go to Admin Portal
                        </a>
                    </Link>
                    <button 
                        onClick={() => setTestMode(true)}
                        className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-full font-black uppercase tracking-widest text-sm hover:border-amber-500 hover:text-amber-600 transition-all transform hover:-translate-y-0.5"
                    >
                        Run System Test
                    </button>
                 </div>
               ) : (
                 <div className="mt-12 text-left animate-fade-in">
                    <div className="mb-10 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between">
                        <p className="text-amber-800 text-xs font-bold uppercase tracking-tight">System Test Mode Active — Submissions will be recorded under your admin UID</p>
                        <button onClick={() => setTestMode(false)} className="text-amber-900 font-black text-xs uppercase hover:underline">Exit Test</button>
                    </div>
                    <ApplicationForm onSubmit={handleApplicationSubmit} />
                 </div>
               )}
            </div>
          )}

          {user && applicationStatus === 'applied' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-50 text-featured-blue rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-blue-100">✉️</div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Application Transmitted</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto font-medium leading-relaxed">Thank you for applying. We have received your application and our team is currently reviewing your profile. You will be contacted via email regarding your interview schedule.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-10 py-4 rounded-full bg-featured-blue text-white font-black uppercase tracking-widest text-sm hover:bg-featured-green transition-all shadow-xl transform hover:-translate-y-0.5" onClick={() => router.push('/')}>Return Home</button>
                {isAdmin && (
                    <button className="px-10 py-4 rounded-full bg-white border-2 border-slate-200 text-slate-600 font-black uppercase tracking-widest text-sm hover:border-featured-blue transition-all transform hover:-translate-y-0.5" onClick={() => { setApplicationStatus('not_applied'); setTestMode(false); }}>Reset Test State</button>
                )}
              </div>
            </div>
          )}

          {user && !isAdmin && applicationStatus === 'loading' && (
            <div className="text-center py-12 animate-pulse">
              <p className="text-slate-400 font-black uppercase tracking-widest">Accessing Secure Records...</p>
            </div>
          )}

          {user && !isAdmin && applicationStatus === 'rejected' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-red-100">✖</div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Mission Status</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto font-medium">We regret to inform you that your application has not been selected for this recruitment cycle. We encourage you to continue your aerospace journey and try again next season!</p>
              <button className="px-10 py-4 rounded-full bg-slate-900 text-white font-black uppercase tracking-widest text-sm hover:bg-featured-blue transition-all shadow-xl transform hover:-translate-y-0.5" onClick={() => router.push('/')}>Return Home</button>
            </div>
          )}

          {user && !isAdmin && applicationStatus === 'accepted' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-green-100 animate-bounce">★</div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Welcome Aboard</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto font-medium">Congratulations! Your application has been accepted. You are now an official member of the AIAA Zewail City Student Branch.</p>
              <button className="px-10 py-4 rounded-full bg-featured-green text-white font-black uppercase tracking-widest text-sm hover:bg-featured-blue transition-all shadow-xl transform hover:-translate-y-0.5" onClick={() => router.push('/dashboard')}>Go to Member Portal</button>
            </div>
          )}

          {/* Interview Scheduling */}
          {interview && interview.status === 'pending' && applicationStatus !== 'accepted' && applicationStatus !== 'rejected' && !isAdmin && (
            <div className="mt-6 bg-slate-50 p-8 md:p-12 rounded-[32px] border border-slate-100 shadow-inner">
              <h2 className="text-2xl font-black mb-6 text-slate-800 uppercase tracking-tight">Mission Interview</h2>
              <p className="text-slate-500 mb-8 font-medium">Please select a time and location that fits your schedule.</p>

              <p className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4 ml-1">Select Engagement Window:</p>
              <div className="grid grid-cols-1 gap-3 mb-8">
                {interview.slots?.map((slot: any, idx: number) => (
                  <label key={idx} className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedSlot === slot ? 'border-featured-blue bg-blue-50 text-featured-blue shadow-md' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}>
                    <input
                      type="radio"
                      name="interview-slot"
                      value={idx}
                      checked={selectedSlot === slot}
                      onChange={() => setSelectedSlot(slot)}
                      className="hidden"
                    />
                    <div>
                        <span className="font-black text-sm uppercase tracking-tighter block">{new Date(slot.time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Location: {slot.location}</span>
                    </div>
                    {selectedSlot === slot && <div className="w-6 h-6 bg-featured-blue text-white rounded-full flex items-center justify-center text-xs">✓</div>}
                  </label>
                ))}
              </div>
              <button onClick={handleConfirmSlot} className="w-full py-5 bg-featured-blue text-white rounded-full font-black uppercase tracking-widest text-sm shadow-xl hover:bg-featured-green transition-all transform hover:-translate-y-0.5">
                Confirm Engagement Schedule
              </button>
            </div>
          )}

          {interview && interview.status === 'scheduled' && applicationStatus !== 'accepted' && applicationStatus !== 'rejected' && !isAdmin && (
              <div className="mt-6 bg-green-50 p-10 rounded-[40px] border border-green-100 text-center shadow-inner">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-sm">📅</div>
                  <h2 className="text-2xl font-black text-green-800 mb-2 uppercase tracking-tight">Interview Locked</h2>
                  <p className="text-green-700 font-medium">Your mission briefing is scheduled for <strong>{new Date(interview.selectedSlot).toLocaleString()}</strong>.</p>
                  <div className="mt-6 pt-6 border-t border-green-100">
                    <p className="text-[10px] text-green-600 font-black uppercase tracking-[0.2em]">Location: {interview.location}</p>
                    {interview.location.toLowerCase().includes('online') && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 italic">Secure link will be sent via Email</p>
                    )}
                  </div>
              </div>
          )}

          {user && !isAdmin && applicationStatus === 'not_applied' && (
            recruitmentOpen ? (
                <div className="py-4">
                   <div className="mb-12">
                        <span className="inline-block px-3 py-1 rounded-full bg-featured-blue/10 text-featured-blue border border-featured-blue/20 text-[8px] font-black mb-4 uppercase tracking-widest">
                            Phase 1: Screening
                        </span>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Candidate <span className="text-featured-blue">Profiling</span></h2>
                        <p className="text-slate-500 mt-2 font-medium">All applicants require a technical/culture interview. Focus on clarity and commitment.</p>
                   </div>
                   <ApplicationForm onSubmit={handleApplicationSubmit} />
                </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm border border-slate-100">🔒</div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Recruitment Halted</h2>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">Engagements are currently closed. Monitor technical frequencies (Social Media) for the next deployment window.</p>
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}