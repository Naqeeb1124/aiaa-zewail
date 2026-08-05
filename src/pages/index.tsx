import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeaturedAnnouncements from '../components/FeaturedAnnouncements';
import FeaturedProjects from '../components/FeaturedProjects';
import FeaturedEvents from '../components/FeaturedEvents';
import Seo from '../components/Seo';
import HeroEgypt from '../components/HeroEgypt';

/**
 * Homepage composition:
 *   • Hero with an asymmetric story-portrait layout (not a centered splash).
 *   • Featured sections now alternate *paper* / *canvas* surfaces so the page
 *     has rhythm rather than continuous navy hero slabs.
 *   • Reduced top padding (the navbar now compacts once you scroll).
 */
export default function Home() {
  return (
    <div className="min-h-screen paper-surface">
      <Seo
        title="AIAA Zewail City. Egypt's only active AIAA student branch."
        description="A peer-led aerospace community at Zewail City. Flight, experiments, research, and the kind of friendship that makes 2 a.m. lab nights bearable."
      />
      <Navbar />

      <main className="pt-20 md:pt-28">
        <HeroEgypt />
        <FeaturedAnnouncements />
        <FeaturedEvents />
        <FeaturedProjects />
      </main>

      <Footer />
    </div>
  );
}
