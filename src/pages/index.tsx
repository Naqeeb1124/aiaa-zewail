import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FeaturedAnnouncements from '../components/FeaturedAnnouncements'
import FeaturedEvents from '../components/FeaturedEvents'
import Seo from '../components/Seo'
import HeroEgypt from '../components/HeroEgypt'

export default function Home(){ 
  return (
    <div className="min-h-screen bg-white">
      <Seo title="AIAA Zewail City - Egypt's Only AIAA Student Branch" />
      <Navbar />
      
      <main className="pt-20 md:pt-[240px]">
        <HeroEgypt />
        <FeaturedAnnouncements />
        <FeaturedEvents />
      </main>
      
      <Footer />
    </div>
  )
}
