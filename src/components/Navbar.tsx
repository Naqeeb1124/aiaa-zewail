import Link from 'next/link';
import Logo from './Logo';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAdmin } from '../hooks/useAdmin';
import { signOut } from '../lib/auth';
import { KICKOFF_MODE } from '../lib/config';
import { useContentCheck } from '../hooks/useContentCheck';

/**
 * Navbar — human-crafted:
 *   • No "feature-blue for everything". Navy is structural only.
 *   • Active link uses a marker underline (animated to scale in)
 *     rather than a color swap to chase attention.
 *   • Mobile overlay uses an off-black surface so the page doesn't
 *     turn into a wall of feature-blue.
 */

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events', id: 'events' },
  { href: '/projects', label: 'Projects', id: 'projects' },
  { href: '/opportunities', label: 'Opportunities', id: 'opportunities' },
  { href: '/tools', label: 'Resources' },
  { href: '/team', label: 'Team' },
  { href: '/join', label: 'Join' },
];

export default function Navbar() {
  const { user, isAdmin } = useAdmin();
  const { hasEvents, hasProjects, hasOpportunities } = useContentCheck();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const visibleLinks = KICKOFF_MODE
    ? [
        { href: '/#board', label: 'Team' },
        { href: '/join', label: 'Register' },
      ]
    : NAV_LINKS.filter(link => {
        if (link.id === 'events') return hasEvents;
        if (link.id === 'projects') return hasProjects;
        if (link.id === 'opportunities') return hasOpportunities;
        return true;
      });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change.
  useEffect(() => {
    const close = () => {
      setMenuOpen(false);
      setDropdownOpen(false);
    };
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-[padding,background-color,box-shadow,border-color] duration-base ease-human border-b border-white/10 ${
        scrolled ? 'bg-deep/95 py-3' : 'bg-deep py-5 md:py-7'
      }`}
      aria-label="Primary"
    >
      <div className="px-6 flex items-center justify-between">
        <Link href="/" className="relative z-50">
          <Logo scrolled={scrolled} />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-7 items-center">
          {visibleLinks.map(link => {
            const isActive = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-semibold text-[0.83rem] tracking-wide duration-base ease-human"
                aria-current={isActive ? 'page' : undefined}
              >
                <span
                  className={`marker-line ${isActive ? 'text-spark' : 'text-white/70 hover:text-white'}`}
                  data-active={isActive ? 'true' : undefined}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                className="w-10 h-10 bg-white/10 flex items-center justify-center text-white font-semibold border border-white/20 hover:bg-white/20 hover:border-white/40 duration-base ease-human"
              >
                {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
              </button>

              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-64 bg-paper text-ink py-3 overflow-hidden animate-rise-in border border-line"
                >
                  <div className="px-5 py-3 border-b border-line bg-canvas-surface">
                    <p className="text-sm text-ink font-semibold tracking-tight truncate">{user.displayName || 'User'}</p>
                    <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm text-ink-soft hover:bg-canvas-surface hover:text-deep duration-fast ease-human"
                    >
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        role="menuitem"
                        className="block px-4 py-2.5 text-sm text-deep hover:bg-canvas-surface duration-fast ease-human font-semibold"
                      >
                        Admin Portal
                      </Link>
                    )}
                    <button
                      role="menuitem"
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2.5 text-sm text-ember hover:bg-canvas-surface duration-fast ease-human font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/join"
              className="btn btn-primary"
            >
              {KICKOFF_MODE ? 'Register' : 'Join Us'}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3 relative z-50">
          {user && (
            <Link
              href="/dashboard"
              className="w-9 h-9 bg-white/10 flex items-center justify-center text-white text-sm font-semibold border border-white/20"
              aria-label="Open dashboard"
            >
              {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="text-white p-2 hover:bg-white/10 duration-base ease-human"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 7h16M4 12h16M4 17h10" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay — off-black surface (NOT more navy). */}
      <div
        className={`fixed inset-0 bg-ink text-white z-40 pt-32 px-6 duration-slow ease-human md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="max-w-md mx-auto space-y-7">
          {visibleLinks.map(link => {
            const isActive = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block text-2xl font-display font-semibold duration-base ease-human ${
                  isActive ? 'text-spark' : 'text-white/60 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="h-px bg-white/10 my-8" />

          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block text-xl font-display font-semibold text-white mb-6"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block text-xl font-display font-semibold text-spark mb-6"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="block text-xl font-display font-semibold text-ember"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/join"
              onClick={() => setMenuOpen(false)}
              className="btn btn-primary w-full"
            >
              {KICKOFF_MODE ? 'Register Now' : 'Join Now'}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
