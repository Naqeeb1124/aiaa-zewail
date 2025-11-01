import { useState } from 'react'

export default function ApplicationForm({ onSubmit }) {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  const handleTeamSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const team = e.target.value
    if (selectedTeams.includes(team)) {
      setSelectedTeams(selectedTeams.filter(t => t !== team))
    } else if (selectedTeams.length < 2) {
      setSelectedTeams([...selectedTeams, team])
    }
  }

  return (
    <form className="mt-6" onSubmit={onSubmit}>
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
        <div>
          <label htmlFor="major" className="block text-sm font-medium text-gray-700">Major & Year</label>
          <div className="mt-1 grid grid-cols-2 gap-x-4">
            <select id="major" name="major" required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
              <option>Aerospace</option>
              <option>Mechanical</option>
              <option>Physics</option>
              <option>Other</option>
            </select>
            <select id="year" name="year" required className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md">
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
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
      {/* ... other conditional sections ... */}


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

      <div className="mt-6">
        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0033A0] hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Submit Application
        </button>
      </div>
    </form>
  )
}
