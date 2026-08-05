import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { db } from '../lib/firebase'
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { teamMembers } from '../lib/teamData'

/**
 * Kickoff landing — student-built.
 *
 * Used when KICKOFF_MODE is true. The branch's intro event. We dropped
 * the AI-tropes ("Launchpad to Aerospace Careers", "Meet the Visionaries")
 * and replaced them with what we actually mean: a first meeting, a list
 * of what we will cover, and the people running it.
 */

const TeamMemberCard = ({ member }: { member: any }) => (
  <article className="card overflow-hidden flex flex-col">
    <div className="relative aspect-[4/5] overflow-hidden bg-canvas-surface">
      <Image
        src={member.image}
        alt={`${member.name}, ${member.role}`}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        style={{ objectFit: 'cover' }}
        className="photo-natural duration-slow ease-human"
      />
      <span className="absolute bottom-4 left-4 chip chip-flagship">
        {member.role}
      </span>
    </div>
    <div className="p-6">
      <p className="eyebrow text-ink-muted">{member.major}</p>
      <h3 className="mt-2 font-display text-[1.2rem] font-semibold text-ink leading-tight">
        {member.name.trim()}
      </h3>
      {(member.linkedin && member.linkedin !== '#') || (member.link && member.link !== '#') ? (
        <div className="mt-4 flex flex-wrap items-center gap-4 text-[14px]">
          {member.linkedin && member.linkedin !== '#' && (
            <a href={member.linkedin} target="_blank" rel="noreferrer" className="marker-line text-sea font-medium">
              LinkedIn
            </a>
          )}
          {member.link && member.link !== '#' && (
            <a href={member.link} target="_blank" rel="noreferrer" className="marker-line text-ember font-medium">
              Portfolio
            </a>
          )}
        </div>
      ) : null}
    </div>
  </article>
)

export default function KickoffPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestEvent = async () => {
      try {
        const eventsRef = collection(db, 'events')

        const qKickoff = query(eventsRef, where('isKickoff', '==', true), limit(1))
        const kickoffSnapshot = await getDocs(qKickoff)

        if (!kickoffSnapshot.empty) {
          setEvent({ id: kickoffSnapshot.docs[0].id, ...kickoffSnapshot.docs[0].data() })
        } else {
          const qUpcoming = query(
            eventsRef,
            where('date', '>=', new Date().toISOString()),
            orderBy('date', 'asc'),
            limit(1)
          )
          const upcomingSnapshot = await getDocs(qUpcoming)

          if (!upcomingSnapshot.empty) {
            setEvent({ id: upcomingSnapshot.docs[0].id, ...upcomingSnapshot.docs[0].data() })
          } else {
            const qRecent = query(eventsRef, orderBy('date', 'desc'), limit(1))
            const recentSnapshot = await getDocs(qRecent)
            if (!recentSnapshot.empty) {
              setEvent({ id: recentSnapshot.docs[0].id, ...recentSnapshot.docs[0].data() })
            }
          }
        }
      } catch (error) {
        console.error('Error fetching kickoff event:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestEvent()
  }, [])

  useEffect(() => {
    if (!event?.date) return

    const target = new Date(event.date)
    const interval = setInterval(() => {
      const now = new Date()
      const diff = target.getTime() - now.getTime()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        clearInterval(interval)
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [event])

  const eventDate = event ? new Date(event.date) : null
  const formattedDate = eventDate
    ? eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date soon'
  const formattedTime = eventDate
    ? eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="min-h-screen paper-surface text-ink">
      <Seo title="Kickoff · AIAA Zewail City" />
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-deep text-white topo-wash pt-28 md:pt-40 pb-16 md:pb-24">
          <div className="relative max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-12 gap-10 items-end">
              <div className="md:col-span-8">
                <span className="eyebrow text-spark inline-flex items-center gap-2">
                  <span className="w-2 h-2 bg-growth animate-pulse" aria-hidden />
                  First meeting
                </span>
                <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">
                  Our first gathering.<br />
                  <span className="text-spark">Pop in.</span>
                </h1>
              </div>
              <div className="md:col-span-4 text-white/85 text-[15.5px] leading-relaxed">
                <p>
                  A 75-minute intro for anyone curious about the branch.
                </p>
                <p>
                  We will walk through who we are, what we are building this
                  semester, and how to hop on a project. Bring questions.
                </p>
              </div>
            </div>

            {!loading && event && (
              <div className="mt-10 flex flex-wrap gap-3">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Mins', value: timeLeft.minutes },
                  { label: 'Secs', value: timeLeft.seconds },
                ].map(unit => (
                  <div
                    key={unit.label}
                    className="px-5 py-3 bg-white/10 border border-white/15"
                  >
                    <div className="font-display text-2xl md:text-3xl font-semibold text-spark leading-none">
                      {unit.value.toString().padStart(2, '0')}
                    </div>
                    <div className="eyebrow text-white/70 mt-1.5">{unit.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <Link
                href={event ? `/join?redirect=/events/${event.id}` : '/join'}
                className="btn btn-primary"
              >
                {event ? 'Save your seat' : 'Apply to the branch'}
              </Link>
            </div>
          </div>
        </section>

        {/* Three honest beats */}
        <section className="bg-paper border-y border-line">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="grid md:grid-cols-3 gap-6 md:gap-7">
              <article className="card p-7 md:p-9">
                <span className="eyebrow text-deep">Where & when</span>
                <h3 className="mt-3 font-display font-semibold text-[1.25rem] leading-tight text-ink">
                  {formattedDate}
                  {formattedTime && <span className="text-ink-soft"> · {formattedTime}</span>}
                </h3>
                <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed">
                  {event?.location || 'Room posted a week before the event.'}
                </p>
                <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed">
                  Stay for the full session. We close with a short Q&amp;A.
                </p>
              </article>

              <article className="card p-7 md:p-9">
                <span className="eyebrow text-ember">What we will cover</span>
                <ul className="mt-4 space-y-3 text-[14.5px] text-ink leading-snug">
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 mt-2 bg-deep" aria-hidden />
                    What AIAA actually is (and what it is not).
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 mt-2 bg-deep" aria-hidden />
                    Aerospace pathways from a Zewail City degree.
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 mt-2 bg-deep" aria-hidden />
                    What our projects look like this semester.
                  </li>
                  <li className="flex gap-3">
                    <span className="w-1.5 h-1.5 mt-2 bg-deep" aria-hidden />
                    How to join, and what the time commitment really is.
                  </li>
                </ul>
              </article>

              <article className="canvas-surface border border-line p-7 md:p-9">
                <span className="eyebrow text-growth">Why bother</span>
                <h3 className="mt-3 font-display font-semibold text-[1.25rem] leading-tight text-ink">
                  You will leave with people to text.
                </h3>
                <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed">
                  Not a recruitment pitch. A real plan of what to do next,
                  a name or two to DM, and a way to sit in on a team for a
                  trial week before deciding anything.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Board section */}
        <section id="board" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl mb-10 md:mb-14">
              <span className="eyebrow text-deep">The board</span>
              <h2 className="mt-2 font-display text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold text-ink leading-tight">
                Students running it this season.
              </h2>
              <p className="lead mt-3">
                Engineers, pilots-in-training, and a few who are useful with a
                soldering iron. Reach out to any of them before the kickoff if
                you want a head start.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
              {teamMembers.map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="bg-deep text-white topo-wash py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="eyebrow text-spark">Still on the fence?</span>
            <h2 className="mt-3 font-display text-[clamp(1.8rem,3.8vw,2.6rem)] font-semibold leading-tight">
              Show up once. Decide after.
            </h2>
            <p className="mt-4 text-white/80 max-w-xl mx-auto text-[16px] leading-relaxed">
              We will not pressure you into anything. Come for the intro.
              Watch a project meeting. Decide by the end of the week.
            </p>
            <div className="mt-7">
              <Link
                href={event ? `/join?redirect=/events/${event.id}` : '/join'}
                className="btn btn-primary"
              >
                Save your seat
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
