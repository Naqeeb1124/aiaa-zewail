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

  const inputClasses = "w-full px-5 py-3.5 bg-paper border border-line focus:border-iris focus:ring-2 focus:ring-iris/20 outline-none duration-base ease-human text-ink placeholder:text-ink-muted font-medium";
  const labelClasses = "block eyebrow text-ink-muted mb-2";
  const sectionTitle = "font-display font-semibold text-[1.35rem] text-ink leading-tight flex items-center gap-3";
  const sectionWrapper = "card p-6 md:p-9";

  const interestAreas = [
    'Aerodynamics', 'Structures', 'Propulsion', 'Controls',
    'Research', 'Marketing', 'Media', 'Sponsorship', 'Events'
  ];

  return (
    <form className="space-y-6" onSubmit={onSubmit}>

      {/* Section 01 · Basic info */}
      <section className={sectionWrapper}>
        <h2 className={sectionTitle}>
            <span className="w-9 h-9 bg-deep text-white flex items-center justify-center eyebrow">01</span>
            The basics
        </h2>
        <p className="text-[14.5px] text-ink-soft mt-2 leading-relaxed">
            We use this to match you with the right sub-team.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div className="md:col-span-2">
                <label className={labelClasses}>Full name</label>
                <input type="text" name="name" required value={formData.name} readOnly className={inputClasses + " cursor-not-allowed opacity-70"} />
            </div>
            <div>
                <label className={labelClasses}>Major</label>
                <select
                    name="major"
                    required
                    value={formData.major}
                    onChange={handleChange}
                    className={inputClasses}
                >
                    <option value="" disabled>Pick your major</option>

                    <optgroup label="CSAI">
                        <option value="Software Development">Software Development</option>
                        <option value="Data Science and Artificial Intelligence">Data Science and AI</option>
                        <option value="Information Technology">Information Technology</option>
                    </optgroup>

                    <optgroup label="Business">
                        <option value="Actuarial Analysis and Risk Management">Actuarial Analysis and Risk Management</option>
                        <option value="Finance and Investment Management">Finance and Investment Management</option>
                        <option value="Marketing, Entrepreneurship and Innovation Management">Marketing, Entrepreneurship and Innovation Management</option>
                        <option value="Operations, Supply Chain and Technology Management">Operations, Supply Chain and Technology Management</option>
                    </optgroup>

                    <optgroup label="Engineering">
                        <option value="Aerospace Engineering">Aerospace Engineering</option>
                        <option value="Communications and Information Engineering">Communications and Information Engineering</option>
                        <option value="Environmental Engineering">Environmental Engineering</option>
                        <option value="Nanotechnology and Nanoelectronics Engineering">Nanotechnology and Nanoelectronics Engineering</option>
                        <option value="Renewable Energy Engineering">Renewable Energy Engineering</option>
                        <option value="Energy and Bioprocess Engineering">Energy and Bioprocess Engineering</option>
                    </optgroup>

                    <optgroup label="Science">
                        <option value="Biomedical Sciences">Biomedical Sciences</option>
                        <option value="Materials Science">Materials Science</option>
                        <option value="Nanoscience">Nanoscience</option>
                        <option value="Physics of Earth and Universe">Physics of Earth and Universe</option>
                    </optgroup>
                </select>
            </div>
            <div>
                <label className={labelClasses}>Year</label>
                <select name="year" required value={formData.year} onChange={handleChange} className={inputClasses}>
                    {[1,2,3,4,5].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            <div>
                <label className={labelClasses}>Phone (WhatsApp)</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="01xxxxxxxxx" />
            </div>
            <div className="md:col-span-2">
                <label className={labelClasses}>Clubs or teams you have been part of</label>
                <textarea name="previous_clubs" value={formData.previous_clubs} onChange={handleChange} rows={2} className={inputClasses} placeholder="Anything counts. List or leave empty."></textarea>
            </div>
        </div>
      </section>

      {/* Section 02 · Time and energy */}
      <section className={sectionWrapper}>
        <h2 className={sectionTitle}>
            <span className="w-9 h-9 bg-ember text-white flex items-center justify-center eyebrow">02</span>
            Time and energy
        </h2>
        <p className="text-[14.5px] text-ink-soft mt-2 leading-relaxed">
            Honest answers beat polished ones. The project lead uses this so they know what to plan around.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div>
                <label className={labelClasses}>Hours per week</label>
                <select name="hours_per_week" required value={formData.hours_per_week} onChange={handleChange} className={inputClasses}>
                    <option>3 to 5 hours</option>
                    <option>5 to 8 hours</option>
                    <option>8 plus</option>
                </select>
            </div>
            <div>
                <label className={labelClasses}>Weekly meetings</label>
                <select name="weekly_meetings" required value={formData.weekly_meetings} onChange={handleChange} className={inputClasses}>
                    <option>Yes, I can</option>
                    <option>No, I cannot</option>
                </select>
            </div>
            <div>
                <label className={labelClasses}>One semester minimum?</label>
                <select name="semester_commitment" required value={formData.semester_commitment} onChange={handleChange} className={inputClasses}>
                    <option>Yes</option>
                    <option>No</option>
                </select>
            </div>
            <div>
                <label className={labelClasses}>Other aerospace clubs on your list?</label>
                <input type="text" name="other_clubs" value={formData.other_clubs} onChange={handleChange} className={inputClasses} placeholder="None, or a name or two" />
            </div>
        </div>
      </section>

      {/* Section 03 · Skills and pull */}
      <section className={sectionWrapper}>
        <h2 className={sectionTitle}>
            <span className="w-9 h-9 bg-growth text-white flex items-center justify-center eyebrow">03</span>
            What pulls you in
        </h2>
        <p className="text-[14.5px] text-ink-soft mt-2 leading-relaxed">
            Pick a few. The tags help us staff projects. They also help you land in the team you actually want.
        </p>
        <div className="space-y-7 mt-6">
            <div>
                <label className={labelClasses}>Areas of interest</label>
                <div className="flex flex-wrap gap-2.5">
                    {interestAreas.map(area => {
                        const selected = selectedInterests.includes(area);
                        return (
                            <button
                                key={area}
                                type="button"
                                onClick={() => handleInterestToggle(area)}
                                className={`px-4 py-2 eyebrow duration-base ease-human border ${
                                    selected
                                        ? 'bg-deep text-white border-deep'
                                        : 'bg-paper text-ink-soft border-line hover:border-deep hover:text-deep'
                                }`}
                            >
                                {area}
                                <input type="hidden" name="interests" value={area} disabled={!selectedInterests.includes(area)} />
                            </button>
                        );
                    })}
                </div>
            </div>
            <div>
                <label className={labelClasses}>Tools you have used</label>
                <textarea name="tools" rows={2} value={formData.tools} onChange={handleChange} className={inputClasses} placeholder="SolidWorks, MATLAB, Python, ANSYS, anything else"></textarea>
            </div>
        </div>
      </section>

      {/* Section 04 · The one question */}
      <section className={sectionWrapper}>
        <h2 className={sectionTitle}>
            <span className="w-9 h-9 bg-iris text-white flex items-center justify-center eyebrow">04</span>
            A real question
        </h2>
        <p className="text-[14.5px] text-ink-soft mt-2 leading-relaxed">
            Skip the corporate answer. Tell us what you would actually do with a chapter on campus.
        </p>
        <div className="mt-6">
            <label className={labelClasses}>What change should this branch bring to the university?</label>
            <textarea name="impact_vision" required rows={5} value={formData.impact_vision} onChange={handleChange} className={inputClasses} placeholder="A few honest sentences."></textarea>
        </div>
      </section>

      <div className="px-2 pt-2">
        <label className="flex items-start gap-4 cursor-pointer group">
            <input type="checkbox" required className="mt-1 w-5 h-5 border-line text-deep focus:ring-2 focus:ring-deep/30 transition-all cursor-pointer bg-paper" />
            <span className="text-[13px] text-ink-soft leading-relaxed group-hover:text-ink duration-base ease-human">
                What I wrote is true to the best of my knowledge.
            </span>
        </label>
      </div>

      <button type="submit" className="btn btn-primary w-full justify-center">
        Send it in
      </button>
    </form>
  )
}
