import Link from 'next/link';
import Logo from './Logo';
import { KICKOFF_MODE } from '../lib/config';

/**
 * Footer — human-crafted:
 *   • Navy used structurally (background) but not the only moving piece.
 *     A warm yellow underline marks link affordance, an off-white
 *     "post it" surface for the newsletter prompt replaces the
 *     "wall of feature-blue" anti-pattern.
 *   • Copy is peer-to-peer and personal, not corporate.
 */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-deep text-white relative overflow-hidden">
      {/* Subtle topographic wash (kept VERY low contrast). */}
      <div className="absolute inset-0 opacity-60 topo-wash pointer-events-none" aria-hidden />

      <div className="relative px-6 pt-16 pb-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Brand block — wider column, asymmetric. */}
          <div className="md:col-span-6">
            <Logo />
            <p className="mt-5 text-white/75 leading-relaxed max-w-md text-[15px]">
              We&apos;re a small team of students building experiments, simulations,
              and research papers — and learning a ton along the way. If you&apos;re curious
              about aerospace, you belong here.
            </p>
            <div className="mt-7 flex gap-3">
              <SocialDot
                href="https://discord.gg/2xMQrCHdPd"
                title="Join our Discord"
                color="#5865F2"
              >
                <DiscordIcon />
              </SocialDot>
              <SocialDot
                href="https://www.instagram.com/aiaazc/"
                title="Follow us on Instagram"
                color="#E1306C"
              >
                <InstagramIcon />
              </SocialDot>
              <SocialDot
                href="https://www.linkedin.com/company/aiaa-student-branch-zewail-city/"
                title="Follow us on LinkedIn"
                color="#0A66C2"
              >
                <LinkedInIcon />
              </SocialDot>
            </div>
          </div>

          {!KICKOFF_MODE && (
            <>
              <div className="md:col-span-3">
                <h4 className="text-white font-display font-semibold mb-4 text-sm tracking-wide">
                  Explore
                </h4>
                <ul className="space-y-2.5 text-[14px]">
                  <FooterLink href="/projects">Projects</FooterLink>
                  <FooterLink href="/opportunities">Opportunities</FooterLink>
                  <FooterLink href="/tools">Resources</FooterLink>
                  <FooterLink href="/privacy">Privacy Policy</FooterLink>
                  <FooterLink href="/terms">Terms of Service</FooterLink>
                </ul>
              </div>

              <div className="md:col-span-3">
                <h4 className="text-white font-display font-semibold mb-4 text-sm tracking-wide">
                  Get involved
                </h4>
                <ul className="space-y-2.5 text-[14px]">
                  <FooterLink href="/join">Become a member</FooterLink>
                  <FooterLink href="/contact">Reach out</FooterLink>
                  <FooterLink href="/admin">Admin portal</FooterLink>
                  <FooterLink href="/about">About the branch</FooterLink>
                </ul>
              </div>
            </>
          )}

          {KICKOFF_MODE && (
            <div className="md:col-span-3">
              <h4 className="text-white font-display font-semibold mb-4 text-sm tracking-wide">
                Explore
              </h4>
              <ul className="space-y-2.5 text-[14px]">
                <FooterLink href="/#board">The Board</FooterLink>
                <FooterLink href="/join">Register</FooterLink>
                <FooterLink href="/admin">Admin portal</FooterLink>
              </ul>
            </div>
          )}
        </div>

        {/* Bottom bar — quiet, honest. */}
        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-start gap-3 text-sm text-white/55">
          <p>© {year} AIAA Student Branch — Zewail City of Science and Technology.</p>
          <p>Designed and built by your fellow branch members.</p>
        </div>
      </div>
    </footer>
  );
}

/* ----------------- Subcomponents ----------------- */

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="marker-line text-white/75 hover:text-white duration-base ease-human"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialDot({
  href,
  title,
  color,
  children,
}: {
  href: string;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      aria-label={title}
      className="w-10 h-10 bg-white/10 flex items-center justify-center text-white duration-base ease-human border border-white/10 hover:text-white"
      style={{ ['--accent' as string]: color }}
      onMouseEnter={(e) => (e.currentTarget.style.background = color)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
    >
      {children}
    </a>
  );
}

/* Inline icons — no emojis. Each sized to a uniform 18×18 footprint. */
function DiscordIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.075.075 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994.076-.144.012-.318-.141-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}
