import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';
import { signInWithGoogle } from '../lib/auth';
import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/router';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import ApplicationForm from '../components/ApplicationForm';
import { useAdmin } from '../hooks/useAdmin';
import { GetServerSideProps } from 'next';

/**
 * Join — human-crafted:
 *   • Asymmetric 5/7 layout with a side rail of "what to expect" beats
 *     the "single centered card" anti-pattern.
 *   • Status states use semantic colours (green for accepted, ember
 *     for closed).
 *   • Off-black ink copy; warm-primary CTA; clear iris focus accents.
 */

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const statusRef = doc(db, 'recruitment', 'status');
    const snap = await getDoc(statusRef);
    return { props: { initialRecruitmentOpen: !!snap.exists() && snap.data().open } };
  } catch {
    return { props: { initialRecruitmentOpen: false } };
  }
};

export default function Join({ initialRecruitmentOpen }: { initialRecruitmentOpen: boolean }) {
  const { user, isAdmin, loading } = useAdmin();
  const router = useRouter();
  const [applicationStatus, setApplicationStatus] = useState<
    'loading' | 'not_applied' | 'applied' | 'accepted' | 'rejected' | 'scheduled'
  >('loading');
  const [recruitmentOpen, setRecruitmentOpen] = useState(initialRecruitmentOpen);
  const [interview, setInterview] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    if (user && applicationStatus === 'accepted' && router.query.redirect) {
      router.push(router.query.redirect as string);
      return;
    }
    if (user && isAdmin && router.query.redirect) {
      router.push(router.query.redirect as string);
      return;
    }

    const unsubStatus = onSnapshot(doc(db, 'recruitment', 'status'), (d) => {
      if (d.exists()) setRecruitmentOpen(d.data().open);
    });

    if (user && !isAdmin) {
      const unsubApp = onSnapshot(doc(db, 'applications', user.uid), (d) => {
        if (d.exists()) {
          const status = d.data().status || 'applied';
          setApplicationStatus(status);
        } else {
          setApplicationStatus('not_applied');
        }
      });
      const unsubInterview = onSnapshot(doc(db, 'interviews', user.uid), (d) => {
        setInterview(d.exists() ? { id: d.id, ...d.data() } : null);
      });
      return () => { unsubStatus(); unsubApp(); unsubInterview(); };
    } else {
      if (!loading && !user) setApplicationStatus('not_applied');
      return () => unsubStatus();
    }
  }, [user, isAdmin, loading, router, applicationStatus]);

  const handleConfirmSlot = async () => {
    if (!selectedSlot || !user) { alert('Please select a time slot.'); return; }
    try {
      await updateDoc(doc(db, 'interviews', user.uid), {
        selectedSlot: selectedSlot.time,
        location: selectedSlot.location,
        status: 'scheduled',
      });
      await updateDoc(doc(db, 'applications', user.uid), { status: 'scheduled' });

      const token = await user.getIdToken();
      const subject = `Interview Scheduled for Your AIAA Zewail City Application`;
      const text = `Your interview has been scheduled for ${new Date(selectedSlot.time).toLocaleString()} at ${selectedSlot.location}.`;
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: user.email || '', subject, text }),
      });

      const adminNotificationResponse = await fetch('/api/interview-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ selectedSlot: selectedSlot.time, location: selectedSlot.location }),
      });
      if (!adminNotificationResponse.ok) {
        console.warn('Interview confirmation succeeded, but admin notification failed.');
      }

      alert('Interview slot confirmed!');
      setInterview({ ...interview, status: 'scheduled', selectedSlot: selectedSlot.time, location: selectedSlot.location });
    } catch (err) {
      console.error(err);
      alert('Failed to confirm slot.');
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const formData = new FormData(e.currentTarget);
    try {
      await setDoc(doc(db, 'applications', user.uid), {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        major: formData.get('major'),
        year: formData.get('year'),
        previous_clubs: formData.get('previous_clubs'),
        hours_per_week: formData.get('hours_per_week'),
        weekly_meetings: formData.get('weekly_meetings'),
        semester_commitment: formData.get('semester_commitment'),
        other_clubs: formData.get('other_clubs'),
        interests: Array.from(formData.getAll('interests')),
        tools: formData.get('tools'),
        impact_vision: formData.get('impact_vision'),
        applicationType: 'interview',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'users', user.uid), {
        phone: formData.get('phone'),
        major: formData.get('major'),
        year: formData.get('year'),
        lastUpdated: new Date().toISOString(),
      }, { merge: true });

      setApplicationStatus('applied');
      if (testMode) alert('Test submission successful!');
    } catch (err: any) {
      console.error(err);
      alert(`Failed to submit: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen paper-surface text-ink">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-deep text-white topo-wash pt-28 md:pt-36 pb-16 md:pb-24">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-10 items-end">
            <div className="md:col-span-7">
              <span className="eyebrow text-spark">Recruitment</span>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">
                Join the<br /><span className="text-spark">next launch.</span>
              </h1>
            </div>
            <div className="md:col-span-5 text-white/85 text-[15.5px] leading-relaxed">
              <p>
                Membership is free for Zewail City students. We&apos;ll ask for
                a one-pager, a short interview, and a willingness to show up
                consistently. In return, you get a sub-team, a build budget,
                and a community that will not let your project crash in silence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-14 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          {/* Side rail — three "what to expect" beats */}
          <aside className="md:col-span-4 space-y-7">
            <Expectation
              eyebrow="01"
              title="Apply"
              body="A short form and a one-line hack you've wanted to pull off."
            />
            <Expectation
              eyebrow="02"
              title="Chat"
              body="A 15-minute interview with a current member. Bring questions."
            />
            <Expectation
              eyebrow="03"
              title="Build"
              body="Pick a sub-team, get tools and mentorship, ship something."
            />
            <div className="canvas-surface border border-line p-6">
              <p className="eyebrow text-ink-muted">Why it matters</p>
              <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed">
                We&apos;re trying to grow a generation of Egyptian aerospace
                builders. Every accepted member joins a real project with
                real deliverables. Not a &quot;network&quot; that emails you
                twice a year.
              </p>
            </div>
          </aside>

          {/* Main card */}
          <section className="md:col-span-8">
            <div className="card p-7 md:p-12">
              <ApplicationStatus
                user={user}
                isAdmin={isAdmin}
                applicationStatus={applicationStatus}
                testMode={testMode}
                setTestMode={setTestMode}
                recruitmentOpen={recruitmentOpen}
                onSubmit={handleApplicationSubmit}
                onReset={() => { setApplicationStatus('not_applied'); setTestMode(false); }}
                onGoHome={() => router.push('/')}
                routerPush={() => router.push('/dashboard')}
              />

              {interview && interview.status === 'pending' && applicationStatus !== 'accepted' && applicationStatus !== 'rejected' && !isAdmin && (
                <InterviewPicker
                  interview={interview}
                  selectedSlot={selectedSlot}
                  onSelect={setSelectedSlot}
                  onConfirm={handleConfirmSlot}
                />
              )}

              {interview && interview.status === 'scheduled' && applicationStatus !== 'accepted' && applicationStatus !== 'rejected' && !isAdmin && (
                <InterviewScheduled interview={interview} />
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function Expectation({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="relative pl-4 border-l border-line">
      <span className="eyebrow text-ember">{eyebrow}</span>
      <h3 className="mt-1 font-display font-semibold text-[1.15rem] text-ink">{title}</h3>
      <p className="mt-2 text-[14.5px] text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}

function StatusBanner({
  icon, kind, title, body, cta,
}: {
  icon: string;
  kind: 'positive' | 'info' | 'warning' | 'neutral';
  title: string;
  body: string;
  cta?: React.ReactNode;
}) {
  const accent =
    kind === 'positive' ? 'bg-growth/15 text-growth ring-1 ring-growth/30'
  : kind === 'warning'  ? 'bg-ember/10 text-ember ring-1 ring-ember/30'
  : kind === 'info'     ? 'bg-iris-soft text-iris ring-1 ring-iris/30'
  :                       'bg-canvas-surface text-ink-soft ring-1 ring-line';
  return (
    <div className="text-center py-8">
      <div className={`mx-auto mb-5 w-16 h-16 flex items-center justify-center text-2xl ${accent}`}>
        {icon}
      </div>
      <h2 className="font-display text-[1.6rem] md:text-[2rem] font-semibold text-ink leading-tight">{title}</h2>
      <p className="mt-3 lead mx-auto">{body}</p>
      {cta && <div className="mt-7 flex flex-wrap justify-center gap-3">{cta}</div>}
    </div>
  );
}

function ApplicationStatus({
  user, isAdmin, applicationStatus, testMode, setTestMode,
  recruitmentOpen, onSubmit, onReset, onGoHome, routerPush,
}: {
  user: any; isAdmin: boolean; applicationStatus: string;
  testMode: boolean; setTestMode: (v: boolean) => void;
  recruitmentOpen: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onGoHome: () => void;
  routerPush: () => void;
}) {
  if (!user) {
    return (
      <StatusBanner
        kind="info"
        icon="👋"
        title="Sign in to apply"
        body="Use your Zewail City Google account so we can match your application to the right sub-team."
        cta={
          <button onClick={signInWithGoogle} className="btn btn-primary">
            Continue with Google
          </button>
        }
      />
    );
  }
  if (user && isAdmin && applicationStatus !== 'applied') {
    if (!testMode) {
      return (
        <StatusBanner
          kind="warning"
          icon="🛡"
          title="You&apos;re signed in as admin"
          body="Admins don&apos;t need to apply. You can still run a system test below."
          cta={
            <>
              <button onClick={() => routerPush()} className="btn btn-secondary">Open portal</button>
              <button onClick={() => setTestMode(true)} className="btn btn-primary">Run system test</button>
            </>
          }
        />
      );
    }
    return (
      <div className="mt-2">
        <div className="mb-6 p-4 bg-spark/15 border border-spark/40 flex items-center justify-between">
          <p className="text-ink text-xs font-medium">Test mode. Submissions record under your admin UID.</p>
          <button onClick={() => setTestMode(false)} className="text-ember font-display font-semibold text-xs uppercase">Exit</button>
        </div>
        <ApplicationForm onSubmit={onSubmit} />
      </div>
    );
  }
  if (user && applicationStatus === 'applied') {
    return (
      <StatusBanner
        kind="info"
        icon="✉"
        title="We got your application"
        body="Our outreach team is reading it now. You&apos;ll hear back within a week. Keep an eye on your email."
        cta={
          <>
            <button onClick={onGoHome} className="btn btn-secondary">Back home</button>
            {isAdmin && (
              <button onClick={onReset} className="btn btn-primary">Reset test state</button>
            )}
          </>
        }
      />
    );
  }
  if (user && !isAdmin && applicationStatus === 'loading') {
    return <p className="text-center py-12 text-ink-muted eyebrow animate-pulse">Accessing secure records[..]</p>;
  }
  if (user && !isAdmin && applicationStatus === 'rejected') {
    return (
      <StatusBanner
        kind="warning"
        icon="[X]"
        title="Not this cycle"
        body="We couldn&apos;t take you in this round. The door is open next semester. Keep building."
        cta={<button onClick={onGoHome} className="btn btn-primary">Back home</button>}
      />
    );
  }
  if (user && !isAdmin && applicationStatus === 'accepted') {
    return (
      <StatusBanner
        kind="positive"
        icon="★"
        title="Welcome aboard"
        body="You&apos;re an official member. Head to your dashboard to pick a sub-team and meet your crew."
        cta={<button onClick={routerPush} className="btn btn-primary">Open dashboard</button>}
      />
    );
  }
  if (user && !isAdmin && applicationStatus === 'scheduled') {
    return null; // The scheduled interview card handles it separately below.
  }
  if (user && !isAdmin && applicationStatus === 'not_applied') {
    if (recruitmentOpen) {
      return (
        <div>
          <div className="mb-8">
            <span className="chip chip-recruiting">Phase 1 · Screening</span>
            <h2 className="mt-3 font-display text-[1.7rem] font-semibold text-ink">Tell us about you.</h2>
            <p className="text-[14.5px] text-ink-soft mt-2">Honest answers are better than polished ones.</p>
          </div>
          <ApplicationForm onSubmit={onSubmit} />
        </div>
      );
    }
    return (
      <StatusBanner
        kind="warning"
        icon="⏸"
        title="Recruitment is paused"
        body="We open applications at the start of each semester. We&apos;ll post everywhere when the next window opens."
        cta={
          <Link href="https://www.instagram.com/aiaazc/" target="_blank" rel="noreferrer" className="btn btn-primary">
            Follow on Instagram
          </Link>
        }
      />
    );
  }
  return null;
}

function InterviewPicker({ interview, selectedSlot, onSelect, onConfirm }: any) {
  return (
    <section className="mt-8 canvas-surface border border-line p-8">
      <h3 className="font-display text-[1.4rem] font-semibold text-ink">Pick a time that works</h3>
      <p className="text-[14.5px] text-ink-soft mt-2">A 15-minute chat with a current member. Casual, no surprises.</p>
      <div className="mt-6 space-y-3">
        {interview.slots?.map((slot: any, idx: number) => {
          const selected = selectedSlot === slot;
          return (
            <label
              key={idx}
              className={`flex items-center justify-between gap-3 p-5 border cursor-pointer duration-base ease-human ${
                selected ? 'border-iris bg-iris-soft' : 'border-line bg-paper hover:border-iris'
              }`}
            >
              <input
                type="radio"
                name="interview-slot"
                checked={selected}
                onChange={() => onSelect(slot)}
                className="sr-only"
              />
              <div>
                <p className="font-display font-semibold text-[15px] text-ink">
                  {new Date(slot.time).toLocaleString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                <p className="eyebrow text-ink-muted mt-1">Location · {slot.location}</p>
              </div>
              {selected && (
                <span className="w-7 h-7 bg-iris text-white flex items-center justify-center text-sm">✓</span>
              )}
            </label>
          );
        })}
      </div>
      <button onClick={onConfirm} className="btn btn-primary w-full mt-6">Confirm schedule</button>
    </section>
  );
}

function InterviewScheduled({ interview }: { interview: any }) {
  return (
    <section className="mt-8 bg-growth/10 border border-growth/30 p-8 text-center">
      <div className="mx-auto w-14 h-14 bg-growth/20 text-growth flex items-center justify-center text-2xl">📅</div>
      <h3 className="mt-4 font-display text-[1.4rem] font-semibold text-ink">You&apos;re booked.</h3>
      <p className="mt-2 text-[15px] text-ink-soft">
        See you on <strong className="text-ink">{new Date(interview.selectedSlot).toLocaleString()}</strong> at <strong className="text-ink">{interview.location}</strong>.
      </p>
      <p className="eyebrow text-ink-muted mt-3">
        {interview.location?.toLowerCase().includes('online') ? 'The video link lands in your inbox.' : 'Bring an idea you can&apos;t stop thinking about.'}
      </p>
    </section>
  );
}
