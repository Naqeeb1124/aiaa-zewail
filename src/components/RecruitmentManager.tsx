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
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <h2 className="text-xl font-semibold mb-2">Recruitment Management</h2>
      <div className="flex items-center">
        <button
          onClick={() => handleSave(!isOpen)}
          className={`px-4 py-2 rounded ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
        >
          {isOpen ? 'Close Recruitment' : 'Open Recruitment'}
        </button>
      </div>
      <div className="mt-4">
        <label className="block">
          Start Date:
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="ml-2 p-2 border rounded"
          />
        </label>
      </div>
      <div className="mt-4">
        <label className="block">
          End Date:
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="ml-2 p-2 border rounded"
          />
        </label>
      </div>
      <button onClick={() => handleSave()} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        Save Dates
      </button>
    </div>
  )
}
