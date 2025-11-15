import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import FeaturedAnnouncements from '../components/FeaturedAnnouncements'
import FeaturedEvents from '../components/FeaturedEvents'

export default function Home(){ 
  return (
    <div>
      <Navbar />
      <main style={{ paddingTop: '240px' }}>
        <Hero />
        <FeaturedAnnouncements />
        <FeaturedEvents />
      </main>
      <Footer />
    </div>
  )
}
