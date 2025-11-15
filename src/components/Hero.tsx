import React from 'react'
import Logo from './Logo'

export default function Hero(){
  return (
    <section className="pt-24 pb-20 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>


          <h1 className="mt-6 text-4xl md:text-5xl font-extrabold leading-tight text-featured-blue">
            AIAA Student Branch — Zewail City of Science & Technology
          </h1>

          <p className="mt-4 text-lg text-slate-700">
            We connect aerospace-minded students at Zewail City with projects, events, and industry.
          </p>

          <div className="mt-6 flex gap-3">
            <a href="/join" className="px-4 py-2 rounded-md bg-featured-blue text-white font-medium hover:bg-featured-green transition-colors">Get involved</a>
            <a href="/events" className="px-4 py-2 rounded-md border">Upcoming events</a>
          </div>
        </div>

        <div>
          <div className="w-full rounded-2xl overflow-hidden shadow-xl border">
            <img alt="Students / Aerospace" src="/hero-mock.jpg" className="w-full h-64 object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}
