import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState, useMemo } from 'react'
import { useAdmin } from '../hooks/useAdmin'
import { parseZewailName } from '../lib/auth'

export default function Contact() {
  const { user } = useAdmin()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const parsedUserInfo = useMemo(() => {
    if (!user) return null;
    return {
      fullName: parseZewailName(user.displayName).fullName,
      email: user.email
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    }

    await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-72 pb-16 md:pb-20 bg-featured-blue text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter">
            Get in <span className="text-white/70 italic">Touch</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium">
            Have questions about membership, projects, or partnerships? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <div className="bg-white rounded-[40px] shadow-sm p-8 md:p-16 border border-slate-100">
          <p className="text-slate-500 mb-12 text-center font-medium leading-relaxed">
            Fill out the form below or email us directly at <br/>
            <a href="mailto:aiaa@zewailcity.edu.eg" className="text-featured-blue font-black hover:text-featured-green transition-colors text-lg uppercase tracking-tight">aiaa@zewailcity.edu.eg</a>
          </p>

          {submitted ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner">✓</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tight">Message Sent!</h2>
              <p className="text-slate-500 font-medium text-lg">Thank you for reaching out. <br/> We will get back to you as soon as possible.</p>
              <button onClick={() => setSubmitted(false)} className="mt-10 px-8 py-3 rounded-full bg-featured-blue text-white font-black uppercase tracking-widest text-sm hover:bg-featured-green transition-all transform hover:-translate-y-0.5 shadow-lg">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="name" className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  id="name" 
                  required 
                  defaultValue={parsedUserInfo?.fullName || ''}
                  readOnly={!!parsedUserInfo?.fullName}
                  placeholder="Tahir Elmudathir"
                  className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-featured-blue/5 focus:border-featured-blue transition-all outline-none font-medium ${parsedUserInfo?.fullName ? 'opacity-75 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">University Email</label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  required 
                  defaultValue={parsedUserInfo?.email || ''}
                  readOnly={!!parsedUserInfo?.email}
                  placeholder="s-name@zewailcity.edu.eg"
                  className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-featured-blue/5 focus:border-featured-blue transition-all outline-none font-medium ${parsedUserInfo?.email ? 'opacity-75 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={5} 
                  required 
                  placeholder="Tell us how we can help..."
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-featured-blue/5 focus:border-featured-blue transition-all outline-none resize-none font-medium"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-5 rounded-full bg-featured-blue text-white font-black uppercase tracking-widest text-sm hover:bg-featured-green transition-all shadow-xl hover:shadow-featured-green/20 disabled:opacity-50 flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </>
                ) : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}