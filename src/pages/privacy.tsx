import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Seo from '../components/Seo'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Seo title="Privacy Policy - AIAA Zewail City" description="Privacy Policy for AIAA Zewail City Student Branch website." />
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 md:pt-48 pb-12 md:pb-16 bg-featured-blue text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter">
            Privacy <span className="text-white/70 italic">Policy</span>
          </h1>
          <p className="text-lg text-white/80 font-medium max-w-2xl mx-auto">
            Transparency about how we collect, use, and protect your personal information.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="bg-white rounded-[40px] shadow-sm p-8 md:p-12 border border-slate-100 space-y-12">
          
          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed">
              Welcome to the AIAA Zewail City Student Branch website. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">2. Data We Collect</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong className="text-slate-800">Identity Data:</strong> includes first name, last name, username or similar identifier, and student ID.</li>
              <li><strong className="text-slate-800">Contact Data:</strong> includes email address and telephone numbers.</li>
              <li><strong className="text-slate-800">Academic Data:</strong> includes your major, year of study, and academic interests.</li>
              <li><strong className="text-slate-800">Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, and operating system.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">3. How We Use Your Data</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>To register you as a new member of the student branch.</li>
              <li>To process your applications for projects, events, or workshops.</li>
              <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
              <li>To administer and protect our business and this website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">4. Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">5. Third-Party Links</h2>
            <p className="text-slate-600 leading-relaxed">
              This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">6. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:aiaa@zewailcity.edu.eg" className="text-featured-blue font-bold hover:text-featured-green transition-colors">aiaa@zewailcity.edu.eg</a>.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
