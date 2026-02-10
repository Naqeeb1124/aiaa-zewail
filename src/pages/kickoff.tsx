import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const teamMembers = [
  {
    name: 'Omar Elmetwally',
    role: 'Chairperson',
    major: 'Aerospace Engineering',
    image: '/board-images/omar-metwally.png',
    linkedin: 'https://www.linkedin.com/in/omar-elmetwally-ba272521b/'
  },
  {
    name: 'Abdelrahman Alnaqeeb',
    role: 'Vice Chairperson',
    major: 'Aerospace Engineering',
    image: '/board-images/naqeeb.jpeg',
    linkedin: '#'
  },
  {
    name: 'Asmaa Sapry',
    role: 'Vice Chairperson',
    major: 'Aerospace Engineering',
    image: '/board-images/Asmaa.jpg',
    linkedin: '#'
  },
  {
    name: 'Walid Sherif ',
    role: 'Technical Operations Officer',
    major: 'Renewable Energy Engineering',
    image: '/board-images/walid.jpeg',
    linkedin: 'https://www.linkedin.com/in/walid-sherif-saeed'
  },
  {
    name: 'Zeina Amr',
    role: 'Secretary',
    major: 'Renewable Energy Engineering',
    image: '/board-images/Zeina amr picture.jpg',
    linkedin: 'https://www.linkedin.com/in/zeina-amr-608a92252'
  },
  {
    name: 'Omar Ghoneim',
    role: 'Treasurer',
    major: 'Business',
    image: '/board-images/Omar Ghoneim.jpg',
    linkedin: '#'
  },
  {
    name:'Maryam Raslan',
    role: 'Marketing & publicity Officer',
    major: 'Business',
    image: '/board-images/MARYAM.jpg',
    linkedin: 'https://www.linkedin.com/in/maryam-raslan-75329222a'
  },
  {
    name: 'Mohamed Ayman',
    role: 'Public Relations Officer',
    major: 'Computer Science',
    image: '/board-images/Mohamed Ayman.jpeg',
    linkedin: 'https://www.linkedin.com/in/mohammed-ayman-8a1772228'
  },
  {
    name: 'Adham Ahmed',
    role: 'General administrative Officer',
    major: 'Aerospace Engineering',
    image: '/board-images/Adham.jpg',
    linkedin: 'https://www.linkedin.com/in/adham-ahmed-800b3b36b'
  }
]

const TeamMemberCard = ({ member }: { member: any }) => (
  <div className="group relative bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-featured-green/50 transition-all duration-500 hover:-translate-y-2">
    <div className="aspect-[4/5] relative overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-gradient-to-t from-featured-blue/90 via-featured-blue/20 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>

      <Image
        src={member.image}
        alt={member.name}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-700"
      />

      <div className="absolute bottom-0 left-0 w-full p-10 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <p className="text-zewail-cyan font-black text-[10px] tracking-[0.2em] uppercase mb-2">{member.role}</p>
        <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight leading-tight">{member.name}</h3>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{member.major}</p>
      </div>
    </div>
  </div>
)

export default function KickoffPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const target = new Date('2026-02-17T12:00:00')
    const interval = setInterval(() => {
      const now = new Date()
      const diff = target.getTime() - now.getTime()
      if (diff <= 0) {
        clearInterval(interval)
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Seo title="Kickoff - AIAA Zewail City" />
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="pt-24 md:pt-48 pb-20 md:pb-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-featured-blue/10 text-featured-blue border border-featured-blue/20 text-xs font-bold mb-8 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-featured-green animate-pulse"></span>
              Founding Launch Execution
            </div>

            <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter text-featured-blue uppercase leading-tight">
              Launchpad to <br />
              <span className="text-zewail-cyan italic">Aerospace</span> Careers
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              Egypt&apos;s only AIAA Student Branch is officially landing. Join us for our kickoff event and start your journey in the aerospace industry.
            </p>

            {/* Countdown */}
            <div className="flex justify-center gap-4 md:gap-8 mb-16">
              {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hours', value: timeLeft.hours },
                { label: 'Mins', value: timeLeft.minutes },
                { label: 'Secs', value: timeLeft.seconds }
              ].map((unit) => (
                <div key={unit.label} className="flex flex-col items-center">
                  <div className="text-4xl md:text-6xl font-black text-featured-blue">{unit.value.toString().padStart(2, '0')}</div>
                  <div className="text-[10px] md:text-xs uppercase font-bold tracking-[0.2em] text-slate-400">{unit.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/join?redirect=/events/RodbpynKzPyWs4OtSv38" 
                className="px-10 py-4 rounded-full bg-featured-blue text-white font-black uppercase tracking-widest text-sm hover:bg-featured-green transition-all shadow-xl transform hover:-translate-y-0.5"
              >
                Register for the Event
              </Link>
            </div>
          </div>
        </section>

        {/* Event Details */}
        <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-50 p-12 rounded-[40px] border border-slate-100 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-featured-blue/10 rounded-2xl flex items-center justify-center mb-8 text-featured-blue">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-featured-blue font-black uppercase tracking-widest text-xs mb-4">When & Where</h3>
                <p className="text-2xl font-black mb-2 text-slate-900 uppercase">Feb 17 or 18</p>
                <p className="text-slate-500 font-medium leading-relaxed">Week 2, University Lecture Hall. 75 minutes of high-impact career mapping.</p>
              </div>

              <div className="bg-slate-50 p-12 rounded-[40px] border border-slate-100 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-featured-blue/10 rounded-2xl flex items-center justify-center mb-8 text-featured-blue">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                </div>
                <h3 className="text-featured-blue font-black uppercase tracking-widest text-xs mb-4">Agenda</h3>
                <ul className="space-y-4 text-slate-600 font-bold uppercase text-[13px] tracking-wider">
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-featured-green rounded-full"></span> What is AIAA?</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-featured-green rounded-full"></span> Aerospace Pathways</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-featured-green rounded-full"></span> Semester Roadmap</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-featured-green rounded-full"></span> Project Networking</li>
                </ul>
              </div>

              <div className="bg-slate-50 p-12 rounded-[40px] border border-slate-100 transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-featured-blue/10 rounded-2xl flex items-center justify-center mb-8 text-featured-blue">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="text-featured-blue font-black uppercase tracking-widest text-xs mb-4">The Value</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Establish your presence, gain career clarity, and secure your spot in the founding cohort of project teams.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="board" className="py-24 md:py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <span className="inline-block px-3 py-1 rounded-full bg-featured-blue/10 text-featured-blue border border-featured-blue/20 text-[10px] font-black mb-6 uppercase tracking-widest">
                The Board
              </span>
              <h2 className="text-4xl md:text-7xl font-black text-featured-blue uppercase tracking-tighter mb-8">
                Meet the <span className="text-featured-blue/70 italic">Visionaries</span>
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                The dedicated students behind the mission. We are pilots, engineers, and visionaries working together to reach new heights.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
              {teamMembers.map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 md:py-40 bg-featured-blue text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-7xl font-black uppercase mb-12 tracking-tighter leading-tight">
              Ready to <span className="text-zewail-cyan italic">Ignite</span> Your Career?
            </h2>
            <Link 
              href="/join?redirect=/events/RodbpynKzPyWs4OtSv38" 
              className="inline-block px-12 py-5 bg-white text-featured-blue font-black uppercase tracking-widest text-lg rounded-full hover:bg-featured-green hover:text-white transition-all shadow-2xl transform hover:-translate-y-1"
            >
              Register Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
