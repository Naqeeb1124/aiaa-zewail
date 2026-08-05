import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useState, useMemo } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { parseZewailName } from '../lib/auth';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Contact — human-crafted:
 *   • Asymmetric 7/5 layout with a "where else you can find us" side panel.
 *   • Off-black form copy and a warm CTA sender button.
 *   • Honest, peer-to-peer copy.
 */

export default function Contact() {
  const { user } = useAdmin();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const parsedUserInfo = useMemo(() => {
    if (!user) return null;
    return { fullName: parseZewailName(user.displayName).fullName, email: user.email };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };
    try {
      await addDoc(collection(db, 'contact_requests'), {
        ...data,
        status: 'unread',
        createdAt: serverTimestamp(),
      });
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch((err) => console.error('Email notification failed', err));
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(`Couldn't send: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen paper-surface text-ink">
      <Navbar />

      <section className="relative overflow-hidden bg-deep text-white topo-wash pt-28 md:pt-36 pb-12 md:pb-20">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <span className="eyebrow text-spark">Reach out</span>
              <h1 className="mt-3 font-display text-[clamp(2.3rem,5.5vw,4rem)] font-semibold leading-[1.05] tracking-tight">
                Let&apos;s talk<br /><span className="text-spark">aerospace.</span>
              </h1>
            </div>
            <div className="md:col-span-5 text-white/85 text-[15.5px] leading-relaxed">
              <p>
                Sponsorship, partnership, project ideas, or a question about
                membership. Drop us a line. We usually reply within 48 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-14 md:py-24">
        <div className="grid md:grid-cols-12 gap-8 md:gap-10">
          {/* Form */}
          <section className="md:col-span-7">
            <div className="card p-8 md:p-12">
              <p className="lead">
                Or email us directly at{' '}
                <a
                  href="mailto:aiaa@zewailcity.edu.eg"
                  className="marker-line text-deep font-semibold"
                >
                  aiaa@zewailcity.edu.eg
                </a>
                .
              </p>

              {submitted ? (
                <div className="mt-10 text-center py-8">
                  <div className="mx-auto w-20 h-20 bg-growth/15 text-growth flex items-center justify-center text-3xl">✓</div>
                  <h3 className="mt-6 font-display text-[1.7rem] font-semibold text-ink">Sent.</h3>
                  <p className="lead mt-3 mx-auto max-w-md">
                    We&apos;ll get back to you soon. Thanks for thinking of us.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="mt-6 btn btn-secondary">Send another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div>
                    <label htmlFor="name" className="eyebrow text-ink-muted block mb-2">Your name</label>
                    <input
                      type="text" name="name" id="name" required
                      defaultValue={parsedUserInfo?.fullName || ''}
                      readOnly={!!parsedUserInfo?.fullName}
                      placeholder="Your name"
                      className={`w-full px-5 py-3.5 bg-paper border border-line focus:border-iris focus:ring-2 focus:ring-iris/20 outline-none duration-base ease-human text-ink placeholder:text-ink-muted ${
                        parsedUserInfo?.fullName ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="eyebrow text-ink-muted block mb-2">Email</label>
                    <input
                      type="email" name="email" id="email" required
                      defaultValue={parsedUserInfo?.email || ''}
                      readOnly={!!parsedUserInfo?.email}
                      placeholder="you@example.com"
                      className={`w-full px-5 py-3.5 bg-paper border border-line focus:border-iris focus:ring-2 focus:ring-iris/20 outline-none duration-base ease-human text-ink placeholder:text-ink-muted ${
                        parsedUserInfo?.email ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="eyebrow text-ink-muted block mb-2">What&apos;s on your mind?</label>
                    <textarea
                      id="message" name="message" rows={6} required
                      placeholder="Tell us a bit about what you want to discuss[..]"
                      className="w-full px-5 py-3.5 bg-paper border border-line focus:border-iris focus:ring-2 focus:ring-iris/20 outline-none duration-base ease-human resize-none text-ink placeholder:text-ink-muted"
                    />
                  </div>
                  <button type="submit" disabled={submitting} className="btn btn-primary w-full justify-center">
                    {submitting ? 'Sending[..]' : 'Send message'}
                  </button>
                  <p className="text-[12.5px] text-ink-muted text-center">
                    By sending, you let us store this message in our inbox so the right person can reply.
                  </p>
                </form>
              )}
            </div>
          </section>

          {/* Side rail */}
          <aside className="md:col-span-5 space-y-6">
            <div className="card p-7">
              <p className="eyebrow text-deep">Where else we hang out</p>
              <ul className="mt-4 space-y-3 text-[15px]">
                <SideRow href="https://discord.gg/2xMQrCHdPd" label="Discord (the real-time nerve center)" />
                <SideRow href="https://www.instagram.com/aiaazc/" label="Instagram (recaps and stories)" />
                <SideRow href="https://www.linkedin.com/company/aiaa-student-branch-zewail-city/" label="LinkedIn (formal updates)" />
              </ul>
            </div>
            <div className="canvas-surface border border-line p-7">
              <p className="eyebrow text-ember">Sponsors & partners</p>
              <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed">
                Looking to support a student-run aerospace lab? Reach out
                with the word &ldquo;partnership&rdquo; in the subject. We&apos;ll
                route you to the right board member.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SideRow({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="marker-line text-deep font-medium"
      >
        {label}
      </a>
    </li>
  );
}
