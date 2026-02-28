import { useState } from 'react'
import { db, auth } from '../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

interface InterviewSlot {
    time: string;
    location: string;
}

interface InterviewSchedulerProps {
  applicationId: string;
  applicantEmail: string;
  applicantName?: string;
}

export default function InterviewScheduler({ applicationId, applicantEmail, applicantName }: InterviewSchedulerProps) {
  const [slots, setSlots] = useState<InterviewSlot[]>([{ time: '', location: '' }])

  const handleSlotChange = (index: number, field: keyof InterviewSlot, value: string) => {
    const newSlots = [...slots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setSlots(newSlots)
  }

  const addSlot = () => {
    setSlots([...slots, { time: '', location: '' }])
  }

  const removeSlot = (index: number) => {
    const newSlots = slots.filter((_, i) => i !== index)
    setSlots(newSlots)
  }

  const handleSchedule = async () => {
    if (!applicantEmail) {
        alert('Critical Error: Applicant email is missing. Please contact technical support.');
        console.error('InterviewScheduler received null applicantEmail');
        return;
    }

    if (slots.some(slot => !slot.time || !slot.location)) {
      alert('Please fill in all time slots and their corresponding locations.')
      return
    }

    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Session expired. Please log in again.');
            return;
        }

        const interviewRef = doc(db, 'interviews', applicationId)
        await setDoc(interviewRef, {
          applicationId,
          applicantEmail,
          slots, // Store the array of {time, location} objects
          status: 'pending',
          createdAt: new Date().toISOString(),
          adminEmail: user.email
        })

        const subject = 'Invitation to Schedule Your Interview with AIAA Zewail City';
        
        // Extract first name for personalization
        const firstName = applicantName ? applicantName.split(' ')[0] : 'Applicant';
        const SITE_URL = 'https://aiaa-zewail.vercel.app';
        const joinLink = `${SITE_URL}/join`;

        // Format slots for the email
        const slotsHtml = slots.map(slot => `
            <li style="margin-bottom: 10px;">
                <strong style="color: #2b4b77;">${new Date(slot.time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                <br/>
                <span style="font-size: 12px; color: #64748b;">Location: ${slot.location}</span>
            </li>
        `).join('');

        const emailHtml = `
            <p>Hi ${firstName},</p>
            <p>You have been invited to schedule an interview for your application to join the <strong>AIAA Zewail City</strong> student branch.</p>
            <p>We have proposed the following time windows for your briefing:</p>
            <ul style="list-style: none; padding-left: 0;">
                ${slotsHtml}
            </ul>
            <div style="margin: 30px 0; text-align: center;">
                <a href="${joinLink}" style="background-color: #2b4b77; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">
                    Select Your Slot Now
                </a>
            </div>
            <p>Please visit the link above to confirm the time slot that works best for you.</p>
            <p>Best regards,<br/>AIAA Zewail City Team</p>
        `;

        const token = await user.getIdToken(true); // Force refresh to ensure latest claims

        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            to: applicantEmail,
            subject,
            html: emailHtml,
          }),
        });

        if (response.ok) {
            // Update Application Status
            await setDoc(doc(db, 'applications', applicationId), {
                status: 'awaiting response'
            }, { merge: true });
            
            alert('Interview invitation sent successfully!')
        } else {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const err = await response.json();
                throw new Error(err.message || 'Failed to send email');
            } else {
                const errorText = await response.text();
                console.error("Non-JSON error response:", errorText);
                throw new Error(`Server error (${response.status}). Please check console for details.`);
            }
        }
    } catch (error: any) {
        console.error("Scheduling error:", error);
        alert(`Error: ${error.message}`);
    }
  }

  const inputClasses = "p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-featured-blue/5 focus:border-featured-blue outline-none text-sm font-medium";

  return (
    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Proposed Windows</h3>
      
      <div className="space-y-4">
        {slots.map((slot, index) => (
          <div key={index} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative group">
            <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Time & Date</label>
                    <input
                      type="datetime-local"
                      value={slot.time}
                      onChange={(e) => handleSlotChange(index, 'time', e.target.value)}
                      className={inputClasses}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">Location</label>
                    <input
                      type="text"
                      value={slot.location}
                      onChange={(e) => handleSlotChange(index, 'location', e.target.value)}
                      placeholder="e.g. Room H101 or Online"
                      className={inputClasses}
                    />
                </div>
            </div>
            
            {slots.length > 1 && (
                <button 
                    onClick={() => removeSlot(index)} 
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                >
                    ✕
                </button>
            )}
          </div>
        ))}
      </div>

      <button 
        onClick={addSlot} 
        className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-featured-blue hover:text-featured-blue hover:bg-white transition-all"
      >
        + Add Another Option
      </button>

      <button 
        onClick={handleSchedule} 
        className="w-full mt-8 py-4 bg-featured-blue text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-featured-green transition-all shadow-xl hover:shadow-featured-green/20"
      >
        Transmit Invitation
      </button>
    </div>
  )
}
