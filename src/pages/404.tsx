import Link from 'next/link'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Seo from '../components/Seo'

export default function Custom404() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Seo title="Page Not Found - AIAA Zewail City" />
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center pt-72 pb-20 px-6">
        <div className="text-center max-w-lg mx-auto">
          <div className="text-[150px] md:text-[200px] font-black text-slate-200 leading-none select-none">
            404
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tighter -mt-10 md:-mt-16 relative z-10">
            Page Not <span className="text-featured-blue">Found</span>
          </h1>
          <p className="text-lg text-slate-500 mb-10 font-medium">
            This page is not part of our flight plan! It might have been moved, renamed, or perhaps it never existed. Let&apos;s get you back on course.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="px-10 py-4 rounded-full bg-featured-blue text-white font-black uppercase tracking-widest text-sm hover:bg-featured-green transition-[transform,background-color,box-shadow] duration-200 shadow-xl hover:shadow-featured-blue/30 transform hover:-translate-y-1 active:scale-95"
            >
              Return to Base
            </Link>
            <Link 
              href="/contact" 
              className="px-10 py-4 rounded-full bg-white text-featured-blue font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-[transform,background-color,box-shadow] duration-200 shadow-md border border-slate-100 transform hover:-translate-y-1 active:scale-95"
            >
              Contact Control
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
