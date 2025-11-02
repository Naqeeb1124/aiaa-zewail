import Link from 'next/link'
import Logo from './Logo'
import { useState, useEffect } from 'react'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { signOut } from '../lib/auth'

export default function Navbar(){
  const [user, setUser] = useState<any>(null)
  useEffect(()=> onAuthStateChanged(auth, u => setUser(u)), [])
  return (
    <nav className="fixed w-full bg-slate-100/30 backdrop-blur-xl z-50 border-b border-gray-200/20">
      <div className="px-6 py-3 flex items-center justify-between">
        <Link href="/" legacyBehavior><a><Logo size={192} /></a></Link>
        <div className="flex gap-4 items-center">
          <Link href="/events" legacyBehavior><a>Events</a></Link>
          <Link href="/projects" legacyBehavior><a>Projects</a></Link>
          <Link href="/team" legacyBehavior><a>Team</a></Link>
          <Link href="/join" legacyBehavior><a>Join</a></Link>
          <Link href="/contact" legacyBehavior><a>Contact</a></Link>
          {user && <Link href="/admin" legacyBehavior><a className="ml-4 px-3 py-1 rounded bg-[#0033A0] text-white">Admin</a></Link>}
          {user && <button className="ml-4 px-3 py-1 rounded bg-red-500 text-white" onClick={signOut}>Logout</button>}
        </div>
      </div>
    </nav>
  )
}
