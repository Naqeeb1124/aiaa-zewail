import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState } from 'react'

export default function Contact() {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="mt-2 text-slate-600">
          Have a question or want to get in touch? Fill out the form below or email us at <a href="mailto:aiaa.zewail@gmail.com" className="text-featured-blue">aiaa.zewail@gmail.com</a>.
        </p>

        {submitted ? (
          <p className="mt-6 text-lg text-green-600">Thank you for your message! We will get back to you soon.</p>
        ) : (
          <form className="mt-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1">
                  <input type="text" name="name" id="name" required className="py-3 px-4 block w-full shadow-sm focus:ring-featured-blue focus:border-featured-blue border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1">
                  <input type="email" name="email" id="email" required className="py-3 px-4 block w-full shadow-sm focus:ring-featured-blue focus:border-featured-blue border-gray-300 rounded-md" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <div className="mt-1">
                  <textarea id="message" name="message" rows={4} required className="py-3 px-4 block w-full shadow-sm focus:ring-featured-blue focus:border-featured-blue border-gray-300 rounded-md"></textarea>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button type="submit" disabled={submitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-featured-blue hover:bg-featured-green transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-featured-blue disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  )
}
