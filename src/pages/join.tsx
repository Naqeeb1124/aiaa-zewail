import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { signInWithGoogle } from '../lib/auth'
import { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/router'
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import ApplicationForm from '../components/ApplicationForm';

export default function Join() {
  const AUTHORIZED = ['s-zeina.tawab@zewailcity.edu.eg', 'mdraz@zewailcity.edu.eg', 's-abdelrahman.alnaqeeb@zewailcity.edu.eg', 's-omar.elmetwalli@zewailcity.edu.eg', 's-asmaa.shahine@zewailcity.edu.eg', 'aeltaweel@zewailcity.edu.eg', 'mabdelshafy@zewailcity.edu.eg']
  const router = useRouter();
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<'loading' | 'not_applied' | 'applied' | 'rejected' | 'accepted'>('loading')
  const [applicationType, setApplicationType] = useState<'interview' | 'no_interview' | null>(null)
  const [recruitmentOpen, setRecruitmentOpen] = useState(false)
  const [interview, setInterview] = useState<any>(null)
  const [selectedSlot, setSelectedSlot] = useState('')

  useEffect(()=> {
    const fetchRecruitmentStatus = async () => {
      const docRef = doc(db, 'recruitment', 'status')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        const now = new Date()
        const startDate = new Date(data.startDate)
        const endDate = new Date(data.endDate)
        setRecruitmentOpen(data.isOpen && now >= startDate && now <= endDate)
      }
    }
    fetchRecruitmentStatus()

    onAuthStateChanged(auth, async u => {
      setUser(u)
      if (u) {
        if (AUTHORIZED.includes(u.email)) {
          setIsAdmin(true)
        }
        const docRef = doc(db, "applications", u.uid)
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const applicationData = docSnap.data();
            setApplicationStatus(applicationData.status || 'applied');
          } else {
            setApplicationStatus('not_applied');
          }
        });

        const interviewRef = doc(db, 'interviews', u.uid)
        const interviewSnap = await getDoc(interviewRef)
        if (interviewSnap.exists()) {
          setInterview(interviewSnap.data())
        }
        
        return () => unsubscribe();
      } else {
        setApplicationStatus('not_applied')
      }
    })
  }, [])

  const handleConfirmSlot = async () => {
    if (!selectedSlot) {
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

    await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: user.email,
        subject,
        text,
      }),
    });

    // Notify admin
    await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 's-abdelrahman.alnaqeeb@zewailcity.edu.eg', // Hardcoded admin email
          subject: `Interview Scheduled with ${user.displayName}`,
          text: `${user.displayName} has scheduled their interview for ${selectedSlot} at ${interview.location}.`,
        }),
      });

    alert('Interview slot confirmed!')
    setInterview({ ...interview, status: 'scheduled', selectedSlot })
  }

  const handleApplicationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const cvFile = formData.get('cv') as File

    let cvUrl = ''
    if (cvFile && cvFile.size > 0) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', cvFile);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
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
    await setDoc(doc(db, "applications", user.uid), data)
    setApplicationStatus('applied')

    const emailBody = Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 's-abdelrahman.alnaqeeb@zewailcity.edu.eg',
        subject: 'New AIAA application',
        text: emailBody,
      }),
    });
  }

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold">Join AIAA — Zewail City</h1>
        {!user && (
          <div>
            <p className="mt-2">Sign in with your Google account to register as a member.</p>
            <button className="mt-6 px-4 py-2 rounded bg-featured-blue text-white hover:bg-featured-green transition-colors" onClick={signInWithGoogle}>Sign in with Google</button>
          </div>
        )}
        {user && isAdmin && (
          <p className="mt-2">You are an administrator. You do not need to apply.</p>
        )}
        {user && !isAdmin && applicationStatus === 'loading' && <p className="mt-2">Loading application status...</p>}
        {user && !isAdmin && applicationStatus === 'applied' && (
          <div>
            <p className="mt-2">Thank you for applying! We have received your application and will get back to you soon.</p>
            <button className="mt-6 px-4 py-2 rounded bg-[#0033A0] text-white" onClick={() => router.push('/')}>Go to Homepage</button>
          </div>
        )}
        {user && !isAdmin && applicationStatus === 'rejected' && (
          <div>
            <p className="mt-2">We regret to inform you that your application has been rejected. We encourage you to apply again in the next recruitment cycle.</p>
            <button className="mt-6 px-4 py-2 rounded bg-[#0033A0] text-white" onClick={() => router.push('/')}>Go to Homepage</button>
          </div>
        )}
        {user && !isAdmin && applicationStatus === 'accepted' && (
          <div>
            <p className="mt-2">Congratulations! Your application has been accepted. Welcome to the team!</p>
            <button className="mt-6 px-4 py-2 rounded bg-[#0033A0] text-white" onClick={() => router.push('/')}>Go to Homepage</button>
          </div>
        )}
        {interview && interview.status === 'pending' && applicationStatus !== 'accepted' && applicationStatus !== 'rejected' && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Schedule Your Interview</h2>
            <p className="mb-2"><strong>Location:</strong> {interview.location}</p>
            <p className="mb-4">Please select one of the available time slots:</p>
            <div className="flex flex-col gap-2">
              {interview.availableSlots.map((slot: string) => (
                <label key={slot} className="flex items-center">
                  <input
                    type="radio"
                    name="interview-slot"
                    value={slot}
                    checked={selectedSlot === slot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="mr-2"
                  />
                  {new Date(slot).toLocaleString()}
                </label>
              ))}
            </div>
            <button onClick={handleConfirmSlot} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
              Confirm Slot
            </button>
          </div>
        )}
        {interview && interview.status === 'scheduled' && applicationStatus !== 'accepted' && applicationStatus !== 'rejected' && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Interview Scheduled</h2>
                <p>Your interview is scheduled for <strong>{new Date(interview.selectedSlot).toLocaleString()}</strong> {interview.location.toLowerCase() === 'online' ? 'online' : `at <strong>${interview.location}</strong>`}.</p>
            </div>
        )}
        {user && !isAdmin && applicationStatus === 'not_applied' && (
          recruitmentOpen ? (
            !applicationType ? (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <button className="px-4 py-2 rounded bg-featured-blue text-white hover:bg-featured-green transition-colors" onClick={() => setApplicationType('interview')}>Apply with interview</button>
                <button className="px-4 py-2 rounded bg-featured-blue text-white hover:bg-featured-green transition-colors" onClick={() => setApplicationType('no_interview')}>Apply without interview</button>
              </div>
            ) : (
              <ApplicationForm onSubmit={handleApplicationSubmit} applicationType={applicationType} />
            )
          ) : (
            <p className="mt-2">Recruitment is currently closed.</p>
          )
        )}
      </main>
      <Footer />
    </div>
  )
}

