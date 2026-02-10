import Link from 'next/link'
import Logo from './Logo'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAdmin } from '../hooks/useAdmin'
import { signOut } from '../lib/auth'
import { KICKOFF_MODE } from '../lib/config'

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/projects', label: 'Projects' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/tools', label: 'Resources' },
  { href: '/team', label: 'Team' },
  { href: '/join', label: 'Join' },
]

export default function Navbar() {
  const { user, isAdmin } = useAdmin()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const visibleLinks = KICKOFF_MODE 
    ? [
        { href: '/#board', label: 'Team' },
        { href: '/join', label: 'Register' }
      ]
    : NAV_LINKS;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navClasses = scrolled
    ? 'bg-featured-blue shadow-lg py-3'
    : 'bg-featured-blue py-6'

  return (
    <nav className={`fixed w-full z-50 transition-[padding,background-color,box-shadow] duration-300 ${navClasses}`}>
      <div className="px-6 flex items-center justify-between">
        <Link href="/" className="relative z-50">
          <Logo scrolled={scrolled} />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {visibleLinks.map(link => {
            const isActive = router.pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`relative font-bold text-sm tracking-wide transition-colors duration-300 group ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`}
              >
                {link.label}
                <span className={`absolute -bottom-2 left-0 w-full h-0.5 bg-featured-green transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
              </Link>
            )
          })}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all shadow-md"
              >
                {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-60 bg-white rounded-[32px] shadow-2xl py-4 overflow-hidden animate-fade-in border border-slate-100">
                  <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-sm text-slate-900 font-black uppercase tracking-tight truncate">{user.displayName || 'User'}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link href="/dashboard" className="block px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-featured-blue transition-colors font-bold rounded-2xl">
                      Dashboard
                    </Link>
                    {isAdmin && (
                        <Link href="/admin" className="block px-4 py-3 text-sm text-featured-blue hover:bg-slate-50 font-bold rounded-2xl">
                          Admin Portal
                        </Link>
                    )}
                    <div className="border-t border-slate-50 mt-2 pt-2">
                        <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold rounded-2xl"
                        >
                        Logout
                        </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/join" 
              className="px-6 py-2.5 rounded-full bg-white text-featured-blue font-bold text-sm hover:bg-featured-green hover:text-white transition-[transform,background-color,color] duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
            >
              {KICKOFF_MODE ? 'Register' : 'Join Us'}
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4 relative z-50">
          {user && (
            <Link 
              href="/dashboard" 
              className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white/20"
            >
              {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </Link>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-white p-1">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-featured-blue z-40 transition-transform duration-300 md:hidden flex flex-col pt-32 px-6 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="space-y-6">
          {visibleLinks.map(link => {
            const isActive = router.pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`block text-2xl font-bold ${isActive ? 'text-white' : 'text-white/60'} hover:text-white transition-colors`} 
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            )
          })}
          
          <div className="h-px bg-white/10 my-8"></div>
          
          {user ? (
            <>
              <Link href="/dashboard" className="block text-xl font-bold text-white mb-6">
                Dashboard
              </Link>
              {isAdmin && (
                <Link href="/admin" className="block text-xl font-bold text-featured-green mb-6">
                  Admin Portal
                </Link>
              )}
              <button onClick={() => signOut()} className="block text-xl font-bold text-red-300">
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/join" 
              className="block w-full text-center py-4 rounded-full bg-white text-featured-blue font-black uppercase tracking-widest text-sm shadow-lg active:scale-95 transition-transform"
            >
              {KICKOFF_MODE ? 'Register Now' : 'Join Now'}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}