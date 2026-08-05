import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// In a real app, this should be an environment variable.
const RECRUITMENT_PASSWORD = '2025'

export default function RecruitmentManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const fetchRecruitmentStatus = async () => {
      const docRef = doc(db, 'recruitment', 'status')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        setIsOpen(data.open ?? data.isOpen ?? false)
        setStartDate(data.startDate)
        setEndDate(data.endDate)
      }
    }
    fetchRecruitmentStatus()
  }, [])

  const handleSave = async (newIsOpenStatus?: boolean) => {
    const password = prompt('Enter the recruitment password:')
    if (password !== RECRUITMENT_PASSWORD) {
      alert('Incorrect password.')
      return
    }

    const docRef = doc(db, 'recruitment', 'status')
    let newStartDate = startDate;
    let newEndDate = endDate;

    if (newIsOpenStatus === true && (!startDate || !endDate)) {
        newStartDate = new Date().toISOString().slice(0, 16);
        const weekLater = new Date();
        weekLater.setDate(weekLater.getDate() + 7);
        newEndDate = weekLater.toISOString().slice(0, 16);
        setStartDate(newStartDate);
        setEndDate(newEndDate);
        alert('Recruitment is now open. Please review and save the start and end dates.');
    }


    const currentStatus = newIsOpenStatus !== undefined ? newIsOpenStatus : isOpen;

    const dataToSave = {
      open: currentStatus,
      isOpen: currentStatus, // Keep both for compatibility
      startDate: newStartDate,
      endDate: newEndDate
    };

    if (newIsOpenStatus !== undefined) {
      setIsOpen(newIsOpenStatus);
    }
    
    await setDoc(docRef, dataToSave, { merge: true })
    if (newIsOpenStatus === undefined) {
      alert('Recruitment dates saved!')
    } else {
      alert(`Recruitment is now ${newIsOpenStatus ? 'open' : 'closed'}.`)
    }
  }

  return (
    <div className="bg-white p-10 border border-line mt-8">
      <h2 className="text-xl font-black text-ink uppercase tracking-tight mb-8">Recruitment Management</h2>
      
      <div className="flex items-center mb-10">
        <button
          onClick={() => handleSave(!isOpen)}
          className={`px-8 py-3 font-black uppercase tracking-widest text-xs transition-all ${isOpen ? 'bg-accent-orange-soft hover:bg-text-ember' : 'bg-growth hover:bg-deep'} text-white transform hover:-translate-y-0.5`}
        >
          {isOpen ? 'Close Recruitment' : 'Open Recruitment'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <label className="block text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mb-3 ml-1">
            Start Date
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-4 bg-canvas border border-line focus:bg-white focus:ring-4 focus:ring-deep/5 focus:border-deep transition-all outline-none font-bold text-ink"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-ink-muted uppercase tracking-[0.2em] mb-3 ml-1">
            End Date
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-4 bg-canvas border border-line focus:bg-white focus:ring-4 focus:ring-deep/5 focus:border-deep transition-all outline-none font-bold text-ink"
          />
        </div>
      </div>

      <button onClick={() => handleSave()} className="w-full py-4 bg-deep hover:bg-growth text-white font-black uppercase tracking-widest text-sm transition-all  transform hover:-translate-y-0.5">
        Save Selection Dates
      </button>
    </div>
  )
}
