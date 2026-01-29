import { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function ApplicationForm({ onSubmit, applicationType }) {
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    major: '',
    year: '1',
    linkedin: '',
    zcid: '',
  })
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        const fetchUserInfo = async () => {
          const docRef = doc(db, 'users', user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const userData = docSnap.data()
            setFormData(prev => ({
              ...prev,
              name: userData.name || user.displayName || '',
              email: userData.email || user.email || '',
              studentId: userData.studentId || '',
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

  const handleTeamSelection = (team: string) => {
    if (selectedTeams.includes(team)) {
      setSelectedTeams(selectedTeams.filter(t => t !== team))
    } else if (selectedTeams.length < 2) {
      setSelectedTeams([...selectedTeams, team])
    }
  }

  const inputClasses = "w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-featured-blue/5 focus:border-featured-blue transition-all outline-none bg-slate-50 focus:bg-white font-medium text-slate-700";
  const labelClasses = "block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em] ml-1";
  const sectionTitle = "text-2xl font-black text-slate-900 mb-10 pb-3 border-b-4 border-featured-green inline-block uppercase tracking-tight";

  return (
    <form className="animate-fade-in" onSubmit={onSubmit}>
      {/* SECTION 1 — Personal Information */}
      <div className="mb-16">
        <h2 className={sectionTitle}>Personal Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
                <label className={labelClasses}>Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClasses} placeholder="Enter your full name" />
            </div>
            <div>
                <label className={labelClasses}>University Email</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClasses} readOnly />
                <p className="text-[10px] font-bold text-slate-400 mt-2 ml-1 italic">* Automatically filled</p>
            </div>
            <div>
                <label className={labelClasses}>Phone (WhatsApp)</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="01xxxxxxxxx" />
            </div>
            
            <div>
                <label className={labelClasses}>Major</label>
                <select name="major" required value={formData.major} onChange={handleChange} className={inputClasses}>
                    <option value="">Select Major</option>
                    <optgroup label="School of Engineering">
                        <option>Aerospace Engineering</option>
                        <option>Communications Engineering</option>
                        <option>Environmental Engineering</option>
                        <option>Nanotechnology Engineering</option>
                        <option>Renewable Energy Engineering</option>
                    </optgroup>
                    <optgroup label="Computational Sciences">
                        <option>Software Development</option>
                        <option>Data Science & AI</option>
                    </optgroup>
                    <optgroup label="School of Science">
                        <option>Biomedical Sciences</option>
                        <option>Nanoscience</option>
                        <option>Physics of Universe</option>
                    </optgroup>
                </select>
            </div>
            <div>
                <label className={labelClasses}>Academic Year</label>
                <select name="year" required value={formData.year} onChange={handleChange} className={inputClasses}>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                </select>
            </div>
        </div>
      </div>

      {/* SECTION 2 — Team Preference */}
      <div className="mb-16">
        <h2 className={sectionTitle}>Team Preference</h2>
        <p className="text-sm text-slate-500 mb-8 font-medium italic">Select up to 2 teams you are interested in joining.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Technical', 'Marketing & Media', 'PR & Events', 'HR', 'Finance'].map(team => (
            <button
              key={team}
              type="button"
              onClick={() => handleTeamSelection(team)}
              className={`p-6 rounded-[24px] border-2 text-left transition-all ${selectedTeams.includes(team) ? 'border-featured-blue bg-blue-50 text-featured-blue' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <div className="font-black uppercase tracking-tight">{team}</div>
              <div className="text-[10px] opacity-60 uppercase mt-2 font-black tracking-widest">{selectedTeams.includes(team) ? 'Selected' : 'Select Team'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3 — Conditional Questions */}
      {selectedTeams.length > 0 && (
        <div className="mb-16">
          <h2 className={sectionTitle}>Specific Questions</h2>
          <div className="space-y-10">
            {selectedTeams.includes('Technical') && (
                <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                    <h3 className="text-lg font-black text-featured-blue mb-6 flex items-center gap-3 uppercase tracking-tight">
                        <span className="w-10 h-10 bg-featured-blue text-white rounded-xl flex items-center justify-center text-sm shadow-lg">🛠</span> 
                        Technical Team
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className={labelClasses}>Primary Interest Area</label>
                            <select name="technical_interest" className={inputClasses}>
                                <option>Aerodynamics</option>
                                <option>Propulsion</option>
                                <option>CAD & Design</option>
                                <option>Controls & Avionics</option>
                                <option>Space Systems</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Relevant Software/Skills</label>
                            <textarea name="technical_software" rows={2} className={inputClasses} placeholder="SolidWorks, MATLAB, Python, etc."></textarea>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="space-y-8">
                <div>
                    <label className={labelClasses}>Why do you want to join AIAA Zewail?</label>
                    <textarea name="motivation_join" rows={4} required className={inputClasses} placeholder="Tell us about your interest in aerospace..."></textarea>
                </div>
                <div>
                    <label className={labelClasses}>What do you hope to achieve?</label>
                    <textarea name="motivation_achieve" rows={4} required className={inputClasses} placeholder="What skills do you want to learn?"></textarea>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6 — Final */}
      <div className="mb-16">
        <h2 className={sectionTitle}>Final Steps</h2>
        <div className="space-y-8">
            <div className="p-8 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 group hover:bg-white hover:border-featured-blue transition-all duration-500">
                <label className={labelClasses}>Upload CV / Portfolio (Optional)</label>
                <input type="file" name="cv" className="w-full text-sm text-slate-500 file:mr-6 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-featured-blue file:text-white hover:file:bg-featured-green file:transition-all cursor-pointer" />
                <p className="text-[10px] font-bold text-slate-400 mt-4 ml-1 uppercase tracking-tight">Maximum file size: 5MB (PDF preferred)</p>
            </div>
            
            <label className="flex items-start gap-4 cursor-pointer group p-2">
                <input type="checkbox" required className="mt-1 w-6 h-6 rounded-md border-slate-300 text-featured-blue focus:ring-4 focus:ring-featured-blue/10 transition-all cursor-pointer" />
                <span className="text-sm text-slate-500 font-medium group-hover:text-slate-900 transition-colors leading-relaxed">
                    I confirm that all information provided is accurate and I understand that I may be contacted for an interview.
                </span>
            </label>
        </div>
      </div>

      <button type="submit" className="w-full py-5 rounded-full bg-featured-blue text-white font-black text-xl hover:bg-featured-green transition-all shadow-xl hover:shadow-featured-green/20 transform hover:-translate-y-1 uppercase tracking-widest">
        Submit Application
      </button>
    </form>
  )
}