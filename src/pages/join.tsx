import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { signInWithGoogle } from '../lib/auth'
import { useState, useEffect } from 'react'
import { auth, db, storage } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/router'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ApplicationForm from '../components/ApplicationForm';

export default function Join() {
  const AUTHORIZED = ['mdraz@zewailcity.edu.eg', 's-abdelrahman.alnaqeeb@zewailcity.edu.eg', 's-omar.elmetwalli@zewailcity.edu.eg', 's-asmaa.shahine@zewailcity.edu.eg', 'aeltaweel@zewailcity.edu.eg', 'mabdelshafy@zewailcity.edu.eg']
  const router = useRouter();  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<'loading' | 'not_applied' | 'applied'>('loading')
  const [applicationType, setApplicationType] = useState<'interview' | 'no_interview' | null>(null)

  useEffect(()=> {
    onAuthStateChanged(auth, async u => {
      setUser(u)
      if (u) {
        if (AUTHORIZED.includes(u.email)) {
          setIsAdmin(true)
        }
        const docRef = doc(db, "applications", u.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setApplicationStatus('applied')
        } else {
          setApplicationStatus('not_applied')
        }
      } else {
        setApplicationStatus('not_applied')
      }
    })
  }, [])

  const handleApplicationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const cvFile = formData.get('cv') as File

    let cvUrl = ''
    if (cvFile && cvFile.size > 0) {
      const storageRef = ref(storage, `cvs/${user.uid}/${cvFile.name}`);
      await uploadBytes(storageRef, cvFile)
      cvUrl = await getDownloadURL(storageRef)
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
            <button className="mt-6 px-4 py-2 rounded bg-[#0033A0] text-white" onClick={signInWithGoogle}>Sign in with Google</button>
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
        {user && !isAdmin && applicationStatus === 'not_applied' && !applicationType && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => setApplicationType('interview')}>Apply with interview</button>
            <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={() => setApplicationType('no_interview')}>Apply without interview</button>
          </div>
        )}
        {user && !isAdmin && applicationStatus === 'not_applied' && applicationType && (
          <ApplicationForm onSubmit={handleApplicationSubmit} applicationType={applicationType} />
        )}
      </main>
      <Footer />
    </div>
  )
}

