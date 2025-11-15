import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import InterviewScheduler from '../../../components/InterviewScheduler'

export default function ApplicationDetail() {
  const router = useRouter()
  const { id } = router.query
  const [application, setApplication] = useState<any>(null)
  const [showScheduler, setShowScheduler] = useState(false)

  useEffect(() => {
    if (id) {
      const fetchApplication = async () => {
        const docRef = doc(db, 'applications', id as string)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setApplication({ id: docSnap.id, ...docSnap.data() })
        }
      }
      fetchApplication()
    }
  }, [id])

  const handleUpdateStatus = async (status: 'accepted' | 'rejected') => {
    const appDoc = doc(db, "applications", id as string);
    await updateDoc(appDoc, { status });

    const subject = `Your AIAA Zewail City Application Status`;
    const text = `Dear applicant,\n\nYour application to join the AIAA Zewail City student branch has been ${status}.\n\nThank you for your interest.\n\nBest regards,\nAIAA Zewail City Team`;

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

  if (!application) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Application Review</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          {Object.entries(application).map(([key, value]) => (
            <div key={key} className="mb-4">
              <h2 className="text-lg font-semibold capitalize">{key.replace(/_/g, ' ')}</h2>
              {key === 'cv' && typeof value === 'string' ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  View CV
                </a>
              ) : (
                <p className="text-gray-700">{Array.isArray(value) ? value.join(', ') : value}</p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={() => handleUpdateStatus('accepted')} className="bg-green-500 text-white px-4 py-2 rounded">Accept</button>
          <button onClick={() => handleUpdateStatus('rejected')} className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
          {application.applicationType === 'interview' && (
            <button onClick={() => setShowScheduler(!showScheduler)} className="bg-blue-500 text-white px-4 py-2 rounded">
              {showScheduler ? 'Hide Scheduler' : 'Schedule Interview'}
            </button>
          )}
        </div>
        {showScheduler && (
          <InterviewScheduler applicationId={id as string} applicantEmail={application.email} />
        )}
      </main>
      <Footer />
    </div>
  )
}