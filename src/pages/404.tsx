import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Seo from '../components/Seo'

/**
 * 404 — student-built.
 *   • Plain speech. Aerospace jokes used to live here; we trade them
 *     for a calmer "this page slipped past us" tone.
 *   • One short sentence up top. One longer sentence below. Asymmetric.
 */

export default function Custom404() {
  return (
    <div className="min-h-screen paper-surface text-ink flex flex-col">
      <Seo title="Page not found · AIAA Zewail City" />
      <Navbar />

      <main className="flex-grow flex items-center justify-center pt-40 md:pt-56 pb-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <span className="eyebrow text-ember">Lost page</span>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-semibold leading-tight tracking-tight text-ink">
            We cannot find that one.
          </h1>

          <div className="mt-7 space-y-4 text-[16.5px] text-ink-soft leading-relaxed">
            <p>
              It probably slipped past us during one of our last redesigns.
            </p>
            <p>
              Head back to the homepage and try the menu first. If you got
              here from a link inside our site, send us a quick note so we
              can fix the route.
            </p>
          </div>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn btn-primary">
              Back to homepage
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Tell us the broken link
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
