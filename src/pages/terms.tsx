import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Seo from '../components/Seo'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Seo title="Terms of Service - AIAA Zewail City" description="Terms of Service for AIAA Zewail City Student Branch website." />
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 md:pt-48 pb-12 md:pb-16 bg-featured-blue text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter">
            Terms of <span className="text-white/70 italic">Service</span>
          </h1>
          <p className="text-lg text-white/80 font-medium max-w-2xl mx-auto">
            The rules and regulations for using our platform and services.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="bg-white rounded-[40px] shadow-sm p-8 md:p-12 border border-slate-100 space-y-12">
          
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">1. Agreement to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing our website, you agree to be bound by these Terms of Service and to comply with all applicable laws and regulations. If you do not agree with these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">2. Use License</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on AIAA Zewail City's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website;</li>
              <li>Remove any copyright or other proprietary notations from the materials; or</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">3. User Accounts</h2>
            <p className="text-slate-600 leading-relaxed">
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">4. Code of Conduct</h2>
            <p className="text-slate-600 leading-relaxed">
              As a member of the AIAA Zewail City Student Branch, you are expected to uphold high standards of professional and personal conduct. Harassment, discrimination, or any form of inappropriate behavior towards other members or staff will not be tolerated and may result in the termination of your membership and access to the website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">5. Disclaimer</h2>
            <p className="text-slate-600 leading-relaxed">
              The materials on AIAA Zewail City's website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">6. Changes to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">7. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about these Terms, please contact us at: <a href="mailto:aiaa@zewailcity.edu.eg" className="text-featured-blue font-bold hover:text-featured-green transition-colors">aiaa@zewailcity.edu.eg</a>.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
