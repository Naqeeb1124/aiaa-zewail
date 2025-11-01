import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { signInWithGoogle } from '../lib/auth'

export default function Join(){
  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold">Join AIAA — Zewail City</h1>
        <p className="mt-2">Sign in with your Google account to register as a member.</p>
        <button className="mt-6 px-4 py-2 rounded bg-[#0033A0] text-white" onClick={signInWithGoogle}>Sign in with Google</button>
      </main>
      <Footer />
    </div>
  )
}
