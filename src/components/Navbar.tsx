import Link from 'next/link'
import Logo from './Logo'
import { useState, useEffect } from 'react'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { signOut } from '../lib/auth'

const AUTHORIZED = ['s-zeina.tawab@zewailcity.edu.eg', 's-abdelrahman.alnaqeeb@zewailcity.edu.eg', 's-omar.elmetwalli@zewailcity.edu.eg', 's-asmaa.shahine@zewailcity.edu.eg', 'aeltaweel@zewailcity.edu.eg']

export default function Navbar(){
  const [user, setUser] = useState<any>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(()=> {
    onAuthStateChanged(auth, u => {
      setUser(u)
      if (u) {
        setIsAdmin(AUTHORIZED.includes(u.email))
      } else {
        setIsAdmin(false)
      }
    })
  }, [])

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur z-50">
      <div className="px-6 py-3 flex items-center justify-between">
        <Link href="/" legacyBehavior><a><Logo /></a></Link>
        <div className="hidden md:flex gap-4 items-center">
          <Link href="/events" legacyBehavior><a>Events</a></Link>
          <Link href="/projects" legacyBehavior><a>Projects</a></Link>
          <Link href="/team" legacyBehavior><a>Team</a></Link>
          <Link href="/join" legacyBehavior><a>Join</a></Link>
          <Link href="/contact" legacyBehavior><a>Contact</a></Link>
          {user ? (
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {user.displayName ? user.displayName[0] : 'U'}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <Link href="/account" legacyBehavior><a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Account Settings</a></Link>
                  {isAdmin && <Link href="/admin" legacyBehavior><a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin</a></Link>}
                  <button onClick={signOut} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/join" legacyBehavior><a>Join</a></Link>
          )}
        </div>
        <div className="md:hidden flex items-center">
          {user && (
            <div className="relative mr-4">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {user.displayName ? user.displayName[0] : 'U'}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <Link href="/account" legacyBehavior><a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Account Settings</a></Link>
                  {isAdmin && <Link href="/admin" legacyBehavior><a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin</a></Link>}
                  <button onClick={signOut} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/events" legacyBehavior><a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Events</a></Link>
            <Link href="/projects" legacyBehavior><a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Projects</a></Link>
            <Link href="/team" legacyBehavior><a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Team</a></Link>
            <Link href="/join" legacyBehavior><a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Join</a></Link>
            <Link href="/contact" legacyBehavior><a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">Contact</a></Link>
          </div>
        </div>
      )}
    </nav>
  )
}
