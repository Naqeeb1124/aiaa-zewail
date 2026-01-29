import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
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
              setApplication({ id: docSnap.id, ...docSnap.data() })
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
            teams: application.teams || []
        });
    }

    const subject = `Your AIAA Zewail City Application Status`;
    const text = `Dear applicant,\n\nYour application to join the AIAA Zewail City student branch has been ${status.toUpperCase()}.\n\n${status === 'accepted' ? 'Welcome to the team! Check your dashboard for next steps.' : 'Thank you for your interest. We encourage you to apply again next cycle.'}\n\nBest regards,\nAIAA Zewail City Team`;

    await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: application.email,
        subject,
        text,
      }),
    });

    router.push('/admin/applications');
  };

  if (loading || !application) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading application...</div>
  }

  // Helper to render fields nicely
  const renderField = (label: string, value: any) => {
      if (!value) return null;
      return (
          <div className="mb-6 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-1">{label}</h3>
              <div className="text-slate-800 font-medium text-lg">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
              </div>
          </div>
      );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        
        <section className="pt-72 pb-12 bg-slate-900 text-white border-b border-slate-800">
            <div className="max-w-4xl mx-auto px-6 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold mb-2">{application.name}</h1>
                    <p className="text-slate-400">{application.major} • Year {application.year}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold text-sm uppercase ${application.status === 'accepted' ? 'bg-green-500 text-white' : application.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-400 text-amber-900'}`}>
                    {application.status || 'Pending'}
                </div>
            </div>
        </section>

        <main className="max-w-4xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold mb-6 text-slate-900 border-b border-slate-100 pb-4">Personal Details</h2>
                        {renderField("Email", application.email)}
                        {renderField("Phone", application.phone)}
                        {renderField("Student ID", application.zcid || application.studentId)}
                        {renderField("LinkedIn", application.linkedin && <a href={application.linkedin} target="_blank" className="text-featured-blue hover:underline break-all">{application.linkedin}</a>)}
                        {renderField("CV / Portfolio", application.cv && <a href={application.cv} target="_blank" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold inline-block text-sm">Download Attachment</a>)}
                    </div>

                    {/* Team Specifics */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                        <h2 className="text-xl font-bold mb-6 text-slate-900 border-b border-slate-100 pb-4">Application Answers</h2>
                        {renderField("Motivation to Join", application.motivation_join)}
                        {renderField("Goals", application.motivation_achieve)}
                        
                        {application.teams?.includes('Technical') && (
                            <>
                                <h3 className="text-sm font-black text-featured-blue mt-8 mb-4 uppercase tracking-widest">Technical Section</h3>
                                {renderField("Interest Area", application.technical_interest)}
                                {renderField("Software Skills", application.technical_software)}
                                {renderField("Challenge Answer", application.technical_challenge)}
                            </>
                        )}
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 sticky top-32">
                        <h3 className="text-lg font-bold mb-4 text-slate-800">Actions</h3>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button onClick={() => handleUpdateStatus('accepted')} className="py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-sm">
                                Accept
                            </button>
                            <button onClick={() => handleUpdateStatus('rejected')} className="py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-sm">
                                Reject
                            </button>
                        </div>

                        {application.applicationType === 'interview' && (
                            <div className="pt-6 border-t border-slate-100">
                                <button 
                                    onClick={() => setShowScheduler(!showScheduler)} 
                                    className={`w-full py-3 rounded-xl font-bold border-2 transition-colors ${showScheduler ? 'border-featured-blue text-featured-blue bg-blue-50' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                >
                                    {showScheduler ? 'Cancel Scheduling' : 'Schedule Interview'}
                                </button>
                                
                                {showScheduler && (
                                    <div className="mt-4">
                                        <InterviewScheduler applicationId={id as string} applicantEmail={application.email} />
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
