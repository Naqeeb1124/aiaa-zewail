import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Image from 'next/image'
import { db } from '../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { GetServerSideProps } from 'next'

// --- Team Member Data ---
// To add a new member, simply add an object to this list!
const teamMembers = [
  {
    name: 'Omar Elmetwally',
    role: 'Chairperson',
    major: 'Aerospace Engineering',
    image: '/board-images/omar-metwally.png',
    link: 'https://sites.google.com/view/omar-elmetwalli/home?authuser=0',
    linkedin: 'https://www.linkedin.com/in/omar-elmetwally-ba272521b/'
  },
  {
    name: 'Abdelrahman Alnaqeeb',
    role: 'Vice Chairperson',
    major: 'Aerospace Engineering',
    image: '/announcements-placeholder-image.jpeg',
    link: 'https://naqeeb1124.github.io/abdelrahman-portfolio/',
    linkedin: '#'
  },
  {
    name: 'Asmaa Sapry',
    role: 'Vice Chairperson',
    major: 'Aerospace Engineering',
    image: '/announcements-placeholder-image.jpeg',
    linkedin: '#',
    link: '#'
  },
  {
    name: 'Walid Sherif ',
    role: 'Technical Head',
    major: 'Renewable Energy Engineering',
    image: '/announcements-placeholder-image.jpeg',
    linkedin: 'https://www.linkedin.com/in/walid-sherif-saeed?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app'
  },
  {
    name: 'Zeina Amr',
    role: 'Secretary',
    major: 'Renewable Energy  Engineering',
    image: '/announcements-placeholder-image.jpeg',
    link: '#',
    linkedin: 'https://www.linkedin.com/in/zeina-amr-608a92252?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app'
  },
  {
    name: 'Ayman Muneer',
    role: 'Media Head',
    major: 'Information Technology',
    image: '/announcements-placeholder-image.jpeg',
    link: '#',
    linkedin: '#'
  },
]

const TeamMemberCard = ({ member }: { member: any }) => (
  <div className="group relative bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-featured-green/50 transition-all duration-500 hover:-translate-y-2">
    <div className="aspect-[4/5] relative overflow-hidden bg-slate-50">
      {/* Image Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-featured-blue/90 via-featured-blue/20 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>

      <Image
        src={member.image}
        alt={member.name}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-700"
      />

      {/* Social Links (appear on hover) */}
      <div className="absolute top-6 right-6 z-20 translate-y-[-20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 flex flex-col gap-3">

        {member.linkedin && member.linkedin !== '#' && (
          <a href={member.linkedin} target="_blank" rel="noreferrer" className="p-3.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-[#0077b5] transition-all hover:scale-110" title="LinkedIn">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
          </a>
        )}

        {member.link && member.link !== '#' && (
          <a href={member.link} target="_blank" rel="noreferrer" className="p-3.5 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-featured-green transition-all hover:scale-110" title="Portfolio / Website">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>
          </a>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-10 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <p className="text-zewail-cyan font-black text-[10px] tracking-[0.2em] uppercase mb-2">{member.role}</p>
        <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight leading-tight">{member.name}</h3>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{member.major}</p>
      </div>
    </div>
  </div>
)

export const getServerSideProps: GetServerSideProps = async () => {
  const docRef = doc(db, 'recruitment', 'status')
  const docSnap = await getDoc(docRef)
  let recruitmentOpen = false
  if (docSnap.exists()) {
    const data = docSnap.data()
    const now = new Date()
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    recruitmentOpen = data.isOpen && now >= startDate && now <= endDate
  }
  return {
    props: {
      recruitmentOpen,
    },
  }
}

export default function Team({ recruitmentOpen }: { recruitmentOpen: boolean }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 md:pt-72 pb-16 md:pb-32 bg-featured-blue text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-black mb-6 uppercase tracking-widest">
            The Crew
          </span>
          <h1 className="text-4xl md:text-7xl font-black mb-8 uppercase tracking-tighter">
            Meet the <span className="text-white/70 italic text-white/90">Visionaries</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
            The dedicated students behind the mission. We are pilots, engineers, and visionaries working together to reach new heights.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
          </div>

          {/* Join CTA */}
          {recruitmentOpen ? (
            <div className="mt-24 text-center bg-white p-12 md:p-20 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl font-black text-slate-900 select-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">?</div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 text-slate-900 leading-tight">Want to be on this board?</h2>
              <p className="text-slate-600 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                We are always looking for passionate individuals to lead our initiatives. Join us and start your journey today.
              </p>
              <Link href="/join" legacyBehavior>
                <a className="inline-block px-10 py-4 rounded-full bg-featured-blue text-white font-black uppercase tracking-widest text-sm hover:bg-featured-green transition-all shadow-xl transform hover:-translate-y-0.5">
                  Apply Now
                </a>
              </Link>
            </div>
          ) : (
            <div className="mt-24 text-center bg-slate-100 p-12 md:p-20 rounded-[40px] border border-slate-200 relative overflow-hidden">
              <h2 className="text-3xl font-black mb-6 text-slate-700">Want to join our team?</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed font-medium">
                Recruitment is currently closed. We usually open applications at the beginning of each semester. Stay tuned for announcements!
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
