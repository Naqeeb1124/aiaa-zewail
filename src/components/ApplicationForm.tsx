import { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

interface ApplicationFormProps {
  onSubmit: (e: any) => void;
}

export default function ApplicationForm({ onSubmit }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    major: '',
    year: '1',
    previous_clubs: '',
    hours_per_week: '3–5 hours',
    weekly_meetings: 'Yes',
    semester_commitment: 'Yes',
    other_clubs: '',
    tools: '',
    impact_vision: '',
  })
  const [selectedInterests, setSelectedTeams] = useState<string[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchUserInfo = async () => {
          const docRef = doc(db, 'users', user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const userData = docSnap.data()
            setFormData(prev => ({
              ...prev,
              name: userData.name || user.displayName || '',
              email: userData.email || user.email || '',
              phone: userData.phone || '',
              major: userData.major || '',
              year: userData.year || '1',
            }))
          }
        }
        fetchUserInfo()
      }
    })
    return () => unsubscribe()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleInterestToggle = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedTeams(selectedInterests.filter(t => t !== interest))
    } else {
      setSelectedTeams([...selectedInterests, interest])
    }
  }

  const inputClasses = "w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-featured-blue/5 focus:border-featured-blue transition-all outline-none bg-slate-50 focus:bg-white font-medium text-slate-700 placeholder:text-slate-300";
  const labelClasses = "block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em] ml-1";
  const sectionTitle = "text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tight";
  const sectionWrapper = "mb-16 p-8 md:p-10 bg-white rounded-[32px] border border-slate-100 shadow-sm";

  const interestAreas = [
    'Aerodynamics', 'Structures', 'Propulsion', 'Controls', 
    'Research', 'Marketing', 'Media', 'Sponsorship', 'Event organization'
  ];

  return (
    <form className="animate-fade-in space-y-6" onSubmit={onSubmit}>
      
      {/* SECTION 1 — Basic Info */}
      <div className={sectionWrapper}>
        <h2 className={sectionTitle}>
            <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs">01</span>
            Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className={labelClasses}>Full Name</label>
                <input type="text" name="name" required value={formData.name} readOnly className={inputClasses + " cursor-not-allowed opacity-70"} />
            </div>
            <div>
                <label className={labelClasses}>Major</label>
                <input type="text" name="major" required value={formData.major} onChange={handleChange} className={inputClasses} placeholder="e.g. Aerospace Engineering" />
            </div>
            <div>
                <label className={labelClasses}>Academic Year</label>
                <select name="year" required value={formData.year} onChange={handleChange} className={inputClasses}>
                    {[1,2,3,4,5].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClasses}>Phone (WhatsApp)</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="01xxxxxxxxx" />
            </div>
            <div className="md:col-span-2">
                <label className={labelClasses}>Previous clubs / teams</label>
                <textarea name="previous_clubs" value={formData.previous_clubs} onChange={handleChange} rows={2} className={inputClasses} placeholder="List any university clubs or technical teams you've been part of..."></textarea>
            </div>
        </div>
      </div>

      {/* SECTION 2 — Commitment Filter */}
      <div className={sectionWrapper}>
        <h2 className={sectionTitle}>
            <span className="w-8 h-8 bg-featured-blue text-white rounded-lg flex items-center justify-center text-xs">02</span>
            Commitment Filter
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className={labelClasses}>Hours per week can you commit?</label>
                <select name="hours_per_week" required value={formData.hours_per_week} onChange={handleChange} className={inputClasses}>
                    <option>3–5 hours</option>
                    <option>5–8 hours</option>
                    <option>8+ hours</option>
                </select>
            </div>
            <div>
                <label className={labelClasses}>Willing to attend weekly meetings?</label>
                <select name="weekly_meetings" required value={formData.weekly_meetings} onChange={handleChange} className={inputClasses}>
                    <option>Yes</option>
                    <option>No</option>
                </select>
            </div>
            <div>
                <label className={labelClasses}>Can you commit for at least one semester?</label>
                <select name="semester_commitment" required value={formData.semester_commitment} onChange={handleChange} className={inputClasses}>
                    <option>Yes</option>
                    <option>No</option>
                </select>
            </div>
            <div>
                <label className={labelClasses}>Applying to other aerospace clubs?</label>
                <input type="text" name="other_clubs" value={formData.other_clubs} onChange={handleChange} className={inputClasses} placeholder="e.g. None, or list names" />
            </div>
        </div>
      </div>

      {/* SECTION 3 — Skills & Interests */}
      <div className={sectionWrapper}>
        <h2 className={sectionTitle}>
            <span className="w-8 h-8 bg-featured-green text-white rounded-lg flex items-center justify-center text-xs">03</span>
            Skills & Interests
        </h2>
        <div className="space-y-8">
            <div>
                <label className={labelClasses}>Areas of Interest</label>
                <div className="flex flex-wrap gap-3">
                    {interestAreas.map(area => (
                        <button
                            key={area}
                            type="button"
                            onClick={() => handleInterestToggle(area)}
                            className={`px-5 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${selectedInterests.includes(area) ? 'border-featured-blue bg-featured-blue text-white shadow-md' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                        >
                            {area}
                            <input type="hidden" name="interests" value={area} disabled={!selectedInterests.includes(area)} />
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className={labelClasses}>Relevant tools you know</label>
                <textarea name="tools" rows={2} value={formData.tools} onChange={handleChange} className={inputClasses} placeholder="SolidWorks, MATLAB, Python, ANSYS, etc."></textarea>
            </div>
        </div>
      </div>

      {/* SECTION 4 — One Smart Question */}
      <div className={sectionWrapper}>
        <h2 className={sectionTitle}>
            <span className="w-8 h-8 bg-pink-500 text-white rounded-lg flex items-center justify-center text-xs">04</span>
            The Mindset
        </h2>
        <div>
            <label className={labelClasses}>What kind of impact do you want this branch to have in the university?</label>
            <textarea name="impact_vision" required rows={4} value={formData.impact_vision} onChange={handleChange} className={inputClasses} placeholder="Think long-term. How should AIAA change the student experience?"></textarea>
        </div>
      </div>

      <div className="mb-12 px-8">
        <label className="flex items-start gap-4 cursor-pointer group">
            <input type="checkbox" required className="mt-1 w-6 h-6 rounded-md border-slate-300 text-featured-blue focus:ring-4 focus:ring-featured-blue/10 transition-all cursor-pointer" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-tight group-hover:text-slate-900 transition-colors leading-relaxed">
                I confirm my commitment to the AIAA mission and understand that interview selection is based on the strategic needs of the branch.
            </span>
        </label>
      </div>

      <button type="submit" className="w-full py-6 rounded-full bg-featured-blue text-white font-black text-xl hover:bg-featured-green transition-all shadow-2xl hover:shadow-featured-green/20 transform hover:-translate-y-1 uppercase tracking-[0.2em]">
        Submit Profile for Review
      </button>
    </form>
  )
}
