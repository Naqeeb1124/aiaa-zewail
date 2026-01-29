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
        setIsOpen(data.isOpen)
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


    const dataToSave: { isOpen: boolean, startDate: string, endDate: string } = {
      isOpen: isOpen,
      startDate: newStartDate,
      endDate: newEndDate
    };

    if (newIsOpenStatus !== undefined) {
      dataToSave.isOpen = newIsOpenStatus;
      setIsOpen(newIsOpenStatus);
    }
    
    await setDoc(docRef, dataToSave)
    if (newIsOpenStatus === undefined) {
      alert('Recruitment dates saved!')
    } else {
      alert(`Recruitment is now ${newIsOpenStatus ? 'open' : 'closed'}.`)
    }
  }

  return (
    <div className="bg-white p-10 rounded-[32px] shadow-sm border border-slate-100 mt-8">
      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-8">Recruitment Management</h2>
      
      <div className="flex items-center mb-10">
        <button
          onClick={() => handleSave(!isOpen)}
          className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-lg ${isOpen ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-featured-green hover:bg-featured-blue shadow-green-100'} text-white transform hover:-translate-y-0.5`}
        >
          {isOpen ? 'Close Recruitment' : 'Open Recruitment'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
            Start Date
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-featured-blue/5 focus:border-featured-blue transition-all outline-none font-bold text-slate-700"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
            End Date
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-featured-blue/5 focus:border-featured-blue transition-all outline-none font-bold text-slate-700"
          />
        </div>
      </div>

      <button onClick={() => handleSave()} className="w-full py-4 bg-featured-blue hover:bg-featured-green text-white rounded-full font-black uppercase tracking-widest text-sm transition-all shadow-xl hover:shadow-featured-blue/20 transform hover:-translate-y-0.5">
        Save Selection Dates
      </button>
    </div>
  )
}
