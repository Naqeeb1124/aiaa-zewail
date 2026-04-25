import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db, auth } from '../../../lib/firebase'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import AdminGuard from '../../../components/AdminGuard'
import InterviewScheduler from '../../../components/InterviewScheduler'

export default function ApplicationDetail() {
  const router = useRouter()
  const { id } = router.query
  const [application, setApplication] = useState<any>(null)
  const [showScheduler, setShowScheduler] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      const fetchApplication = async () => {
        try {
            const docRef = doc(db, 'applications', id as string)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
              const data = docSnap.data();
              let email = data.email;
              
              // Fallback: if email is missing in application, check the users collection
              if (!email) {
                  const userRef = doc(db, 'users', id as string);
                  const userSnap = await getDoc(userRef);
                  if (userSnap.exists()) {
                      email = userSnap.data().email;
                  }
              }
              
              setApplication({ id: docSnap.id, ...data, email })
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
      }
      fetchApplication()
    }
  }, [id])

  const handleUpdateStatus = async (status: 'accepted' | 'rejected') => {
    if(!confirm(`Are you sure you want to ${status} this applicant?`)) return;
    
    try {
        const appDoc = doc(db, "applications", id as string);
        await updateDoc(appDoc, { status });

        // Also update the user record and create member record if accepted
        if (status === 'accepted') {
            // Update general user profile
            const userRef = doc(db, 'users', id as string);
            await setDoc(userRef, {
                role: 'member'
            }, { merge: true });

            // Create official member record
            const memberRef = doc(db, 'members', id as string);
            await setDoc(memberRef, {
                name: application.name,
                email: application.email,
                studentId: application.zcid || application.studentId || '',
                joinedAt: new Date().toISOString(),
                points: 10,
                teams: application.interests || []
            });
        }

        const subject = status === 'accepted' 
            ? 'Welcome to the Team! Your AIAA Zewail City Application' 
            : 'Update regarding your application to AIAA Zewail City';

        // Extract first name for personalized greeting
        const firstName = application.name ? application.name.split(' ')[0] : 'Applicant';
        
        const text = status === 'accepted'
            ? `Hi ${firstName},\n\nWelcome to the team! Your application to join the AIAA Zewail City student branch has been ACCEPTED. We are thrilled to have you on board.\n\nPlease check your dashboard on our website for next steps and to get started with your new team.\n\nBest regards,\nAIAA Zewail City Team`
            : `Dear applicant,\n\nThank you for your interest in joining the AIAA Zewail City student branch. After careful review, we regret to inform you that your application has not been selected for this cycle.\n\nWe encourage you to continue pursuing your interests in aerospace and to apply again in future recruitment cycles.\n\nBest regards,\nAIAA Zewail City Team`;

        const token = await auth.currentUser?.getIdToken();

        const emailRes = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            to: application.email,
            subject,
            text,
          }),
        });

        if (!emailRes.ok) {
          const errData = await emailRes.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Email API error:', emailRes.status, errData);
          alert(`Application ${status} successfully, but notification email FAILED: ${errData.message || errData.error || 'Unknown error'}`);
        } else {
          alert(`Application ${status} successfully and notification email sent.`);
        }
        router.push('/admin/applications');
    } catch (error: any) {
        console.error("Status update error:", error);
        alert(`Failed to update status: ${error.message}`);
    }
  };

  if (loading || !application) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading application...</div>
  }

  // Helper to render fields nicely
  const renderField = (label: string, value: any) => {
      if (!value) return null;
      return (
          <div className="mb-6 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <h3 className="text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">{label}</h3>
              <div className="text-slate-800 font-bold text-lg leading-relaxed">
                  {Array.isArray(value) ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                          {value.map(v => <span key={v} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-black uppercase">{v}</span>)}
                      </div>
                  ) : String(value)}
              </div>
          </div>
      );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        
        <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
            <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <span className="inline-block px-3 py-1 bg-featured-blue rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Candidate Profile</span>
                    <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter uppercase">{application.name}</h1>
                    <p className="text-slate-400 font-bold">{application.major} • Year {application.year}</p>
                </div>
                <div className={`px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest ${application.status === 'accepted' ? 'bg-green-500 text-white' : application.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-400 text-amber-950'}`}>
                    {application.status || 'Pending Review'}
                </div>
            </div>
        </section>

        <main className="max-w-4xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-200">
                        <h2 className="text-xl font-black mb-8 text-slate-900 border-b-4 border-slate-100 pb-4 uppercase tracking-tight">01. Personal Details</h2>
                        {renderField("University Email", application.email)}
                        {renderField("Phone (WhatsApp)", application.phone)}
                        {renderField("Student ID", application.zcid || application.studentId)}
                        {renderField("Previous clubs / teams", application.previous_clubs)}
                    </div>

                    {/* Commitment Filter */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-200">
                        <h2 className="text-xl font-black mb-8 text-slate-900 border-b-4 border-featured-blue pb-4 uppercase tracking-tight">02. Commitment Filter</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                            {renderField("Hours per week", application.hours_per_week)}
                            {renderField("Weekly Meetings", application.weekly_meetings)}
                            {renderField("Semester Commitment", application.semester_commitment)}
                            {renderField("Other Club Applications", application.other_clubs)}
                        </div>
                    </div>

                    {/* Skills & Interests */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-200">
                        <h2 className="text-xl font-black mb-8 text-slate-900 border-b-4 border-featured-green pb-4 uppercase tracking-tight">03. Skills & Interests</h2>
                        {renderField("Areas of Interest", application.interests)}
                        {renderField("Known Tools", application.tools)}
                    </div>

                    {/* Mindset */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-200">
                        <h2 className="text-xl font-black mb-8 text-slate-900 border-b-4 border-pink-500 pb-4 uppercase tracking-tight">04. The Mindset</h2>
                        {renderField("Vision for the Branch", application.impact_vision)}
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 sticky top-32">
                        <h3 className="text-lg font-black mb-6 text-slate-800 uppercase tracking-widest">Admin Control</h3>
                        
                        <div className="grid grid-cols-1 gap-3 mb-8">
                            <button onClick={() => handleUpdateStatus('accepted')} className="w-full py-4 bg-featured-green text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:shadow-featured-green/20 transition-all">
                                Approve Member
                            </button>
                            <button onClick={() => handleUpdateStatus('rejected')} className="w-full py-4 border-2 border-red-100 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition-all">
                                Reject Profile
                            </button>
                        </div>

                        {application.applicationType === 'interview' && (
                            <div className="pt-8 border-t border-slate-100">
                                <button 
                                    onClick={() => setShowScheduler(!showScheduler)} 
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 transition-all ${showScheduler ? 'border-featured-blue text-featured-blue bg-blue-50' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
                                >
                                    {showScheduler ? 'Close Scheduler' : 'Propose Interview'}
                                </button>
                                
                                {showScheduler && (
                                    <div className="mt-6 animate-fade-in">
                                        <InterviewScheduler 
                                            applicationId={id as string} 
                                            applicantEmail={application.email} 
                                            applicantName={application.name}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
        <Footer />
      </div>
    </AdminGuard>
  )
}
