import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { signInWithGoogle } from '../lib/auth'
import { useState, useEffect } from 'react'
import { auth, db, storage } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/router'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AUTHORIZED = ['officer1@zewail.edu.eg', 's-abdelrahman.alnaqeeb@zewailcity.edu.eg']

export default function Join(){
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<'loading' | 'not_applied' | 'applied'>('loading')
  const [applicationType, setApplicationType] = useState<'interview' | 'no_interview' | null>(null)
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [selectedMajor, setSelectedMajor] = useState('')
  const router = useRouter()

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

  const handleTeamSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const team = e.target.value
    if (selectedTeams.includes(team)) {
      setSelectedTeams(selectedTeams.filter(t => t !== team))
    } else if (selectedTeams.length < 2) {
      setSelectedTeams([...selectedTeams, team])
    }
  }

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
      teams: selectedTeams,
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
          <form className="mt-6" onSubmit={handleApplicationSubmit}>
            {/* SECTION 1 — Personal Information */}
            <h2 className="text-xl font-bold">SECTION 1 — Personal Information</h2>
            <div className="grid grid-cols-1 gap-y-6 mt-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1">
                  <input type="text" name="name" id="name" required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">University Email</label>
                <div className="mt-1">
                  <input type="email" name="email" id="email" required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1">
                  <input type="tel" name="phone" id="phone" required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                </div>
              </div>
              {applicationType === 'no_interview' && (
                <div>
                  <label htmlFor="zcid" className="block text-sm font-medium text-gray-700">Zewail City ID</label>
                  <div className="mt-1">
                    <input type="text" name="zcid" id="zcid" required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="major" className="block text-sm font-medium text-gray-700">Major & Year</label>
                <div className="mt-1 grid grid-cols-2 gap-x-4">
                  <select id="major" name="major" required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" onChange={(e) => setSelectedMajor(e.target.value)}>
                    <optgroup label="Engineering">
                      <option>Aerospace</option>
                      <option>Communications and Information</option>
                      <option>Environmental</option>
                      <option>Nanotechnology and Nanoelectronics</option>
                      <option>Renewable Energy</option>
                    </optgroup>
                    <optgroup label="Computational Science and Artificial Intelligence">
                      <option>Software Development</option>
                      <option>Data Science and Artificial Intelligence</option>
                      <option>Information Technology</option>
                    </optgroup>
                    <optgroup label="Science">
                      <option>Biomedical Sciences</option>
                      <option>Nanoscience</option>
                      <option>Physics of Universe</option>
                    </optgroup>
                    <optgroup label="Business">
                      <option>Actuarial Analysis and Risk Management</option>
                      <option>Finance and Investment Management</option>
                      <option>Marketing and Innovation Management</option>
                      <option>Operations and Technology Management</option>
                    </optgroup>
                  </select>
                  <select id="year" name="year" required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
                    {['Aerospace', 'Communications and Information', 'Environmental', 'Nanotechnology and Nanoelectronics', 'Renewable Energy'].includes(selectedMajor) ? (
                      <>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                      </>
                    ) : (
                      <>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">LinkedIn / Portfolio (optional)</label>
                <div className="mt-1">
                  <input type="text" name="linkedin" id="linkedin" className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                </div>
              </div>
            </div>

            {applicationType === 'no_interview' && (
              <>
                {/* SECTION 2 — Team Preference */}
                <h2 className="text-xl font-bold mt-8">SECTION 2 — Team Preference</h2>
                <p className="text-sm text-gray-600">You can choose up to 2 teams that you want to apply for.</p>
                <div className="mt-4 grid grid-cols-1 gap-y-2">
                  <label className="inline-flex items-center">
                    <input type="checkbox" name="team" value="Technical" onChange={handleTeamSelection} checked={selectedTeams.includes('Technical')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                    <span className="ml-2">Technical</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="checkbox" name="team" value="Marketing & Media" onChange={handleTeamSelection} checked={selectedTeams.includes('Marketing & Media')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                    <span className="ml-2">Marketing & Media</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="checkbox" name="team" value="PR & Events" onChange={handleTeamSelection} checked={selectedTeams.includes('PR & Events')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                    <span className="ml-2">PR & Events</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="checkbox" name="team" value="HR" onChange={handleTeamSelection} checked={selectedTeams.includes('HR')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                    <span className="ml-2">HR</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="checkbox" name="team" value="Finance" onChange={handleTeamSelection} checked={selectedTeams.includes('Finance')} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                    <span className="ml-2">Finance</span>
                  </label>
                </div>

                {/* SECTION 3 — Conditional Questions */}
                {selectedTeams.includes('Technical') && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold">SECTION 3A — Technical Team</h3>
                    <div className="grid grid-cols-1 gap-y-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Which area interests you most?</label>
                        <div className="mt-1">
                          <select name="technical_interest" className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
                            <option>Aerodynamics</option>
                            <option>Propulsion</option>
                            <option>CAD & Design</option>
                            <option>Controls</option>
                            <option>Space Systems</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">List any software you’ve used before (SolidWorks, MATLAB, Python, COMSOL, etc.).</label>
                        <div className="mt-1">
                          <input type="text" name="technical_software" className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Have you worked on any technical projects before?</label>
                        <div className="mt-1">
                          <select name="technical_projects" className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Describe one technical challenge you enjoyed solving or would like to learn about.</label>
                        <div className="mt-1">
                          <textarea name="technical_challenge" rows={4} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">What would you like to gain from joining the technical team?</label>
                        <div className="mt-1">
                          <textarea name="technical_gain" rows={4} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {selectedTeams.includes('Marketing & Media') && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold">SECTION 3B — Marketing & Media Team</h3>
                    <div className="grid grid-cols-1 gap-y-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Which skills do you have?</label>
                        <div className="mt-1">
                          <input type="text" name="marketing_skills" className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Which tools do you use? (e.g. Canva, Photoshop, Premiere Pro, CapCut, etc.)</label>
                        <div className="mt-1">
                          <input type="text" name="marketing_tools" className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Have you managed or contributed to any social media pages before?</label>
                        <div className="mt-1">
                          <select name="marketing_experience" className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Show us your creative side — share a link to any post, design, or idea you’ve made (optional).</label>
                        <div className="mt-1">
                          <input type="text" name="marketing_idea" className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">What do you think AIAA Zewail’s Instagram or content should focus on?</label>
                        <div className="mt-1">
                          <textarea name="marketing_focus" rows={4} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {selectedTeams.includes('PR & Events') && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold">SECTION 3C — PR & Events Team</h3>
                    <div className="grid grid-cols-1 gap-y-6 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Have you ever organized an event or handled external communication before?</label>
                            <div className="mt-1">
                                <select name="pr_experience" className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
                                    <option>Yes</option>
                                    <option>No</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">How would you approach a company or guest speaker for collaboration?</label>
                            <div className="mt-1">
                                <textarea name="pr_approach" rows={4} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">What ideas do you have for events or partnerships AIAA Zewail could do?</label>
                            <div className="mt-1">
                                <textarea name="pr_ideas" rows={4} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                            </div>
                        </div>
                    </div>
                  </div>
                )}
                {selectedTeams.includes('HR') && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold">SECTION 3D — HR Team</h3>
                    <div className="grid grid-cols-1 gap-y-6 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Why are you interested in HR work?</label>
                            <div className="mt-1">
                                <textarea name="hr_interest" rows={4} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">What do you think makes a team function effectively?</label>
                            <div className="mt-1">
                                <textarea name="hr_teamwork" rows={4} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">If team motivation drops, what would you do to fix it?</label>
                            <div className="mt-1">
                                <textarea name="hr_motivation" rows={4} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                            </div>
                        </div>
                    </div>
                  </div>
                )}
                {selectedTeams.includes('Finance') && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold">SECTION 3E — Finance Team</h3>
                    <div className="grid grid-cols-1 gap-y-6 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Do you have experience with finance, Excel, or sponsorships?</label>
                            <div className="mt-1">
                                <select name="finance_experience" className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
                                    <option>Yes</option>
                                    <option>No</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">How would you convince a company to sponsor a student branch?</label>
                            <div className="mt-1">
                                <textarea name="finance_sponsorship" rows={4} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">What fundraising or income ideas would you suggest for AIAA Zewail?</label>
                            <div className="mt-1">
                                <textarea name="finance_fundraising" rows={4} className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                            </div>
                        </div>
                    </div>
                  </div>
                )}

                {/* SECTION 4 — Availability & Commitment */}
                <h2 className="text-xl font-bold mt-8">SECTION 4 — Availability & Commitment</h2>
                <div className="grid grid-cols-1 gap-y-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">How many hours per week can you dedicate to AIAA?</label>
                    <div className="mt-1">
                      <select name="availability" required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
                        <option>2–4</option>
                        <option>5–8</option>
                        <option>9+</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Are you willing to attend biweekly meetings?</label>
                    <div className="mt-1">
                      <select name="meetings" required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="commitments" className="block text-sm font-medium text-gray-700">Do you have other major commitments this semester?</label>
                    <div className="mt-1">
                      <input type="text" name="commitments" id="commitments" className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                    </div>
                  </div>
                </div>

                {/* SECTION 5 — Motivation */}
                <h2 className="text-xl font-bold mt-8">SECTION 5 — Motivation</h2>
                <div className="grid grid-cols-1 gap-y-6 mt-4">
                  <div>
                    <label htmlFor="motivation_join" className="block text-sm font-medium text-gray-700">Why do you want to join AIAA Zewail?</label>
                    <div className="mt-1">
                      <textarea id="motivation_join" name="motivation_join" rows={4} required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="motivation_achieve" className="block text-sm font-medium text-gray-700">What do you hope to learn or achieve through this experience?</label>
                    <div className="mt-1">
                      <textarea id="motivation_achieve" name="motivation_achieve" rows={4} required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"></textarea>
                    </div>
                  </div>
                </div>

                {/* SECTION 6 — Final */}
                <h2 className="text-xl font-bold mt-8">SECTION 6 — Final</h2>
                <div className="grid grid-cols-1 gap-y-6 mt-4">
                  <div>
                    <label htmlFor="cv" className="block text-sm font-medium text-gray-700">Upload your CV or portfolio (optional)</label>
                    <div className="mt-1">
                      <input type="file" name="cv" id="cv" className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md" />
                    </div>
                  </div>
                  <div>
                    <label className="inline-flex items-center">
                      <input type="checkbox" name="confirmation" required className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                      <span className="ml-2">I confirm that all information provided is accurate.</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="mt-6">
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0033A0] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Submit Application
              </button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  )
}
