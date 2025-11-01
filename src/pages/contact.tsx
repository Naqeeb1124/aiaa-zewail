import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Page(){
  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }} className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold">Contact</h1>
        <p className="mt-3">Content for Contact page.</p>
      </main>
      <Footer />
    </div>
  )
}
