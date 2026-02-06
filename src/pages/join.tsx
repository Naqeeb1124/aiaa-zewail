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
  const [applicationType, setApplicationType] = useState<'interview' | 'no_interview' | null>(null)
  const [recruitmentOpen, setRecruitmentOpen] = useState(initialRecruitmentOpen)
  const [interview, setInterview] = useState<any>(null)
  const [selectedSlot, setSelectedSlot] = useState<string>('')

  useEffect(() => {
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
  }, [user, isAdmin, loading])

  const handleConfirmSlot = async () => {
    if (!selectedSlot || !user) {
      alert('Please select a time slot.')
      return
    }

    const interviewRef = doc(db, 'interviews', user.uid)
    await updateDoc(interviewRef, {
      selectedSlot,
      status: 'scheduled',
    })

    const subject = `Interview Scheduled for Your AIAA Zewail City Application`;
    const text = `Dear applicant,\n\nYour interview has been scheduled for ${selectedSlot} at ${interview.location}.\n\nBest regards,\nAIAA Zewail City Team`;

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
          text: `${user.displayName} has scheduled their interview for ${selectedSlot} at ${interview.location}.`,
        }),
      })
    ));

    alert('Interview slot confirmed!')
    setInterview({ ...interview, status: 'scheduled', selectedSlot })
  }

  const handleApplicationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return;

    const formData = new FormData(e.currentTarget)
    const cvFile = formData.get('cv') as File

    const token = await user.getIdToken()
// ... later in the component ...

    let cvUrl = ''
    if (cvFile && cvFile.size > 0) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', cvFile);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadFormData,
        });

        if (!response.ok) {
          throw new Error('CV upload failed');
        }

        const data = await response.json();
        cvUrl = data.url;
      } catch (error) {
        console.error('Error uploading CV:', error);
        alert('There was an error uploading your CV. Please try again.');
        return; // Stop form submission if CV upload fails
      }
    }
    
    const zcid = formData.get('zcid') as string;
    if (applicationType === 'no_interview' && zcid && !/^20\d{7}$/.test(zcid)) {
      alert('Invalid Zewail City ID format. It should be in the format 20XXXXXXX.');
      return;
    }

    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      major: formData.get('major'),
      year: formData.get('year'),
      linkedin: formData.get('linkedin'),
      teams: Array.from(formData.getAll('team')),
      technical_interest: formData.get('technical_interest'),
      technical_software: formData.get('technical_software'),
      technical_projects: formData.get('technical_projects'),
      technical_challenge: formData.get('technical_challenge'),
      technical_gain: formData.get('technical_gain'),
      marketing_skills: formData.get('marketing_skills'),
      marketing_tools: formData.get('marketing_tools'),
      marketing_experience: formData.get('marketing_experience'),
      marketing_idea: formData.get('marketing_idea'),
      marketing_focus: formData.get('marketing_focus'),
      pr_experience: formData.get('pr_experience'),
      pr_approach: formData.get('pr_approach'),
      pr_ideas: formData.get('pr_ideas'),
      hr_interest: formData.get('hr_interest'),
      hr_teamwork: formData.get('hr_teamwork'),
      hr_motivation: formData.get('hr_motivation'),
      finance_experience: formData.get('finance_experience'),
      finance_sponsorship: formData.get('finance_sponsorship'),
      finance_fundraising: formData.get('finance_fundraising'),
      availability: formData.get('availability'),
      meetings: formData.get('meetings'),
      commitments: formData.get('commitments'),
      motivation_join: formData.get('motivation_join'),
      motivation_achieve: formData.get('motivation_achieve'),
      cv: cvUrl,
      applicationType,
    }
    if (user) {
      await setDoc(doc(db, "applications", user.uid), data)
      setApplicationStatus('applied')
    }

    const emailBody = Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

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
          subject: 'New AIAA application',
          text: emailBody,
        }),
      })
    ));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-72 pb-16 md:pb-20 bg-featured-blue text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase tracking-tighter">
            Join the <span className="text-white/70 italic">Mission</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium">
            Become a part of the world&apos;s largest aerospace professional society at Zewail City.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
          {!user && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-50 text-featured-blue rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">👤</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Registration</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto">Please sign in with your Zewail City Google account to register as a member and access the application form.</p>
              <button 
                className="px-8 py-4 rounded-full bg-featured-blue text-white font-bold text-lg hover:bg-featured-green transition-all shadow-lg hover:shadow-featured-blue/30 flex items-center justify-center gap-3 mx-auto transform hover:-translate-y-0.5" 
                onClick={signInWithGoogle}
              >
                Sign in with Google
              </button>
            </div>
          )}

          {user && isAdmin && (
            <div className="text-center py-12">
               <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🛡️</div>
               <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Account</h2>
               <p className="text-slate-500">You are logged in as an administrator. You do not need to submit a membership application.</p>
               <Link href="/admin" className="inline-block mt-8 px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-featured-blue transition-all shadow-lg transform hover:-translate-y-0.5">
                  Go to Admin Portal
               </Link>
            </div>
          )}

          {user && !isAdmin && applicationStatus === 'loading' && (
            <div className="text-center py-12 animate-pulse">
              <p className="text-slate-400 font-bold uppercase tracking-widest">Checking status...</p>
            </div>
          )}

          {user && !isAdmin && applicationStatus === 'applied' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-50 text-featured-blue rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✉️</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Received!</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto font-medium">Thank you for applying. We have received your application and our team is currently reviewing it. We will contact you via email soon.</p>
              <button className="px-10 py-3 rounded-full bg-featured-blue text-white font-bold hover:bg-featured-green transition-all shadow-lg transform hover:-translate-y-0.5" onClick={() => router.push('/')}>Return Home</button>
            </div>
          )}

          {user && !isAdmin && applicationStatus === 'rejected' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">✖</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Status</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto font-medium">We regret to inform you that your application has been rejected for this cycle. We encourage you to try again next semester!</p>
              <button className="px-10 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-featured-blue transition-all shadow-lg transform hover:-translate-y-0.5" onClick={() => router.push('/')}>Return Home</button>
            </div>
          )}

          {user && !isAdmin && applicationStatus === 'accepted' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">★</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to AIAA!</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto font-medium">Congratulations! Your application has been accepted. You are now an official member of the AIAA Zewail City Student Branch.</p>
              <button className="px-10 py-3 rounded-full bg-featured-green text-white font-bold hover:bg-featured-blue transition-all shadow-lg transform hover:-translate-y-0.5" onClick={() => router.push('/dashboard')}>Go to Dashboard</button>
            </div>
          )}

          {/* Interview Scheduling */}
          {interview && interview.status === 'pending' && applicationStatus !== 'accepted' && applicationStatus !== 'rejected' && (
            <div className="mt-6 bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Schedule Your Interview</h2>
              <div className="flex items-center gap-4 mb-8 p-4 bg-white rounded-xl border border-slate-100">
                <div className="w-12 h-12 bg-blue-100 text-featured-blue rounded-full flex items-center justify-center text-xl">📍</div>
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase">Location</p>
                   <p className="font-bold text-slate-700">{interview.location}</p>
                </div>
              </div>

              <p className="font-bold text-slate-700 mb-4">Select a time slot:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {interview.availableSlots.map((slot: string) => (
                  <label key={slot} className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedSlot === slot ? 'border-featured-blue bg-blue-50 text-featured-blue' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <input
                      type="radio"
                      name="interview-slot"
                      value={slot}
                      checked={selectedSlot === slot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="hidden"
                    />
                    <span className="font-bold text-sm uppercase tracking-tighter">{new Date(slot).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </label>
                ))}
              </div>
              <button onClick={handleConfirmSlot} className="w-full py-4 bg-featured-blue text-white rounded-full font-black uppercase tracking-widest text-sm shadow-lg hover:bg-featured-green transition-all transform hover:-translate-y-0.5">
                Confirm Interview Slot
              </button>
            </div>
          )}

          {interview && interview.status === 'scheduled' && applicationStatus !== 'accepted' && applicationStatus !== 'rejected' && (
              <div className="mt-6 bg-green-50 p-10 rounded-[32px] border border-green-100 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">📅</div>
                  <h2 className="text-2xl font-black text-green-800 mb-2">Interview Scheduled</h2>
                  <p className="text-green-700 font-medium">Your interview is confirmed for <strong>{new Date(interview.selectedSlot).toLocaleString()}</strong>.</p>
                  <p className="text-sm text-green-600 mt-4 font-bold uppercase tracking-wider">{interview.location.toLowerCase() === 'online' ? 'Meeting link will be sent via email' : `Location: ${interview.location}`}</p>
              </div>
          )}

          {user && !isAdmin && applicationStatus === 'not_applied' && (
            recruitmentOpen ? (
              !applicationType ? (
                <div className="py-8">
                  <h2 className="text-3xl font-black text-slate-900 mb-2 text-center tracking-tight">Application Type</h2>
                  <p className="text-slate-500 text-center mb-12 font-medium">Choose how you would like to apply. Technical roles usually require an interview.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <button 
                      className="p-10 rounded-[32px] bg-slate-50 border-2 border-slate-100 hover:border-featured-blue hover:bg-white transition-all text-left group hover:shadow-2xl hover:shadow-featured-blue/5 transform hover:-translate-y-1" 
                      onClick={() => setApplicationType('interview')}
                    >
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:bg-featured-blue group-hover:text-white transition-all duration-500">🎤</div>
                      <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Apply with Interview</h3>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">Recommended for Technical, HR, and Leadership positions.</p>
                    </button>
                    <button 
                      className="p-10 rounded-[32px] bg-slate-50 border-2 border-slate-100 hover:border-featured-blue hover:bg-white transition-all text-left group hover:shadow-2xl hover:shadow-featured-blue/5 transform hover:-translate-y-1" 
                      onClick={() => setApplicationType('no_interview')}
                    >
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm group-hover:bg-featured-blue group-hover:text-white transition-all duration-500">📝</div>
                      <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Apply without Interview</h3>
                      <p className="text-sm text-slate-500 leading-relaxed font-medium">Fast-track for general membership and supportive roles.</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                   <button onClick={() => setApplicationType(null)} className="mb-8 text-xs font-black text-featured-blue flex items-center gap-2 hover:gap-3 transition-all uppercase tracking-widest">
                      ← Back to Selection
                   </button>
                   <ApplicationForm onSubmit={handleApplicationSubmit} applicationType={applicationType} />
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🔒</div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Recruitment Closed</h2>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">Applications are currently closed. Please follow our social media for announcements about the next cycle.</p>
              </div>
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}