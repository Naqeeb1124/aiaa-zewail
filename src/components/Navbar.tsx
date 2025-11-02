import Link from 'next/link'
import Logo from './Logo'
import { useState, useEffect } from 'react'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { signOut } from '../lib/auth'

const AUTHORIZED = ['officer1@zewail.edu.eg', 's-abdelrahman.alnaqeeb@zewailcity.edu.eg']

export default function Navbar(){
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  useEffect(()=> onAuthStateChanged(auth, u => setUser(u)), [])
  return (
    <nav className="fixed w-full bg-slate-100/30 backdrop-blur-xl z-50 border-b border-gray-200/20">
      <div className="px-6 py-3 flex items-center justify-between">
        <Link href="/" legacyBehavior><a><Logo /></a></Link>
        <div className="hidden md:flex gap-4 items-center">
          <Link href="/events" legacyBehavior><a>Events</a></Link>
          <Link href="/projects" legacyBehavior><a>Projects</a></Link>
          <Link href="/team" legacyBehavior><a>Team</a></Link>
          <Link href="/join" legacyBehavior><a>Join</a></Link>
          <Link href="/contact" legacyBehavior><a>Contact</a></Link>
          {user && AUTHORIZED.includes(user.email) && <Link href="/admin" legacyBehavior><a className="ml-4 px-3 py-1 rounded bg-[#0033A0] text-white">Admin</a></Link>}
          {user && <button onClick={() => {
            if (window.confirm('Are you sure you want to logout?')) {
              signOut()
            }
          }}>Logout</button>}
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden px-6 pt-2 pb-4">
          <div className="flex flex-col gap-4 items-center">
            <Link href="/events" legacyBehavior><a>Events</a></Link>
            <Link href="/projects" legacyBehavior><a>Projects</a></Link>
            <Link href="/team" legacyBehavior><a>Team</a></Link>
            <Link href="/join" legacyBehavior><a>Join</a></Link>
            <Link href="/contact" legacyBehavior><a>Contact</a></Link>
            {user && AUTHORIZED.includes(user.email) && <Link href="/admin" legacyBehavior><a className="mt-4 px-3 py-1 rounded bg-[#0033A0] text-white">Admin</a></Link>}
            {user && <button className="mt-4 px-3 py-1 rounded bg-red-500 text-white" onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                signOut()
              }
            }}>Logout</button>}
          </div>
        </div>
      )}
    </nav>
  )
}
