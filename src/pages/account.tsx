import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'
import { auth, db } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { parseZewailName } from '../lib/auth'

/**
 * Account — student-built.
 *   • Two columns of honest profile facts. Not a credential wall.
 *   • Off-black ink. Warm chip if an application exists.
 *   • One short sentence in the headline, one longer one below.
 */

export default function Account() {
  const [user, setUser] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)

  useEffect(() => {
    onAuthStateChanged(auth, u => {
      setUser(u)
      if (u) {
        const fetchApplication = async () => {
          const appRef = doc(db, 'applications', u.uid)
          const appSnap = await getDoc(appRef)
          if (appSnap.exists()) {
            setApplication(appSnap.data())
          }
        }
        fetchApplication()
      }
    })
  }, [])

  const fullName = parseZewailName(user?.displayName).fullName

  return (
    <div className="min-h-screen paper-surface text-ink">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-32 md:pt-40 pb-16 md:pb-24">
        <header className="mb-12">
          <span className="eyebrow text-ember">Your file</span>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-tight text-ink">
            What we have on you.
          </h1>
          <p className="lead mt-3">
            Edit anything that is wrong, and tell us if a field is missing.
          </p>
        </header>

        <div className="space-y-7">
          {user && (
            <article className="card p-7 md:p-10">
              <div className="flex items-center gap-4 mb-7">
                <div className="w-14 h-14 bg-deep text-white flex items-center justify-center text-xl font-display font-semibold">
                  {(fullName || user.email || 'U')[0].toUpperCase()}
                </div>
                <h2 className="font-display text-[1.4rem] font-semibold text-ink">
                  Profile
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-7">
                <Field label="Name" value={fullName || 'Not set'} />
                <Field label="Email" value={user.email} />
              </div>
            </article>
          )}

          {application && (
            <article className="card p-7 md:p-10">
              <div className="flex items-center gap-4 mb-7">
                <span className="chip chip-recruiting">Submitted</span>
                <h2 className="font-display text-[1.4rem] font-semibold text-ink">
                  Application
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-y-6 gap-x-8">
                {Object.entries(application)
                  .filter(([key]) => !['userId', 'status'].includes(key))
                  .map(([key, value]) => (
                    <Field
                      key={key}
                      label={key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                      value={Array.isArray(value) ? value.join(', ') : String(value)}
                    />
                  ))}
              </div>
            </article>
          )}

          {!user && (
            <p className="text-ink-muted eyebrow">
              Sign in to see your profile.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow text-ink-muted">{label}</p>
      <p className="mt-1 text-ink font-display font-semibold text-[17px] leading-snug">
        {value}
      </p>
    </div>
  )
}
