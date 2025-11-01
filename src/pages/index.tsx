import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Footer from '../components/Footer'

export default function Home(){ 
  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }}>
        <Hero />
        <section className="max-w-6xl mx-auto p-6">
          <h2 className="text-2xl font-bold">Latest announcements</h2>
          <p className="mt-2 text-slate-600">Announcements will appear here.</p>
        </section>
      </main>
      <Footer />
    </div>
  )
}
