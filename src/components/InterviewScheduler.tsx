import { useState } from 'react'
import { db } from '../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export default function InterviewScheduler({ applicationId, applicantEmail }) {
  const [slots, setSlots] = useState([''])
  const [location, setLocation] = useState('')

  const handleSlotChange = (index, value) => {
    const newSlots = [...slots]
    newSlots[index] = value
    setSlots(newSlots)
  }

  const addSlot = () => {
    setSlots([...slots, ''])
  }

  const removeSlot = (index) => {
    const newSlots = slots.filter((_, i) => i !== index)
    setSlots(newSlots)
  }

  const handleSchedule = async () => {
    if (slots.some(slot => slot === '') || !location) {
      alert('Please fill in all time slots and the location.')
      return
    }

    const interviewRef = doc(db, 'interviews', applicationId)
    await setDoc(interviewRef, {
      applicationId,
      applicantEmail,
      availableSlots: slots,
      location,
      status: 'pending',
    })

    const subject = 'Invitation to Schedule Your Interview with AIAA Zewail City';
    const text = `Dear applicant,\n\nYou have been invited to schedule an interview for your application to join the AIAA Zewail City student branch. Please visit your account page on our website to select a time slot that works for you.\n\nBest regards,\nAIAA Zewail City Team`;

    await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: applicantEmail,
        subject,
        text,
      }),
    });

    alert('Interview invitation sent!')
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h2 className="text-2xl font-bold mb-4">Schedule Interview</h2>
      <div className="mb-4">
        <label className="block font-semibold">Interview Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="e.g., Online (Google Meet), Room H101"
        />
      </div>
      <div>
        <label className="block font-semibold">Available Time Slots</label>
        {slots.map((slot, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="datetime-local"
              value={slot}
              onChange={(e) => handleSlotChange(index, e.target.value)}
              className="p-2 border rounded flex-grow"
            />
            <button onClick={() => removeSlot(index)} className="ml-2 text-red-500">Remove</button>
          </div>
        ))}
        <button onClick={addSlot} className="text-blue-500">Add another slot</button>
      </div>
      <button onClick={handleSchedule} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        Send Invitation
      </button>
    </div>
  )
}
