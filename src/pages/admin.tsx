import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/router'

const AUTHORIZED = ['officer1@zewail.edu.eg']

export default function Admin(){
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(()=> onAuthStateChanged(auth, u => { setUser(u); if(!u) router.push('/join') }), [])

  if(!user) return <div className="pt-24">Redirecting to sign-in…</div>
  if(!AUTHORIZED.includes(user.email)) return <div className="pt-24 p-6">You are not authorized.</div>

  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-2">Manage events, projects, and members.</p>
      </main>
      <Footer />
    </div>
  )
}
