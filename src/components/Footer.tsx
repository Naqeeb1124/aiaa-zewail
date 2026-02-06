import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-featured-blue text-white/80 border-t border-white/10">
      <div className="px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Logo />
            <p className="mt-6 text-white/70 leading-relaxed max-w-md">
              The American Institute of Aeronautics and Astronautics (AIAA) Student Branch at Zewail City dedicated to advancing aerospace engineering and science.
            </p>
            <div className="mt-6 flex gap-4">
              {/* Social Icons */}
              <a href="https://discord.gg/9KhjKKCu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#5865F2]/10 text-[#5865F2] flex items-center justify-center hover:bg-[#5865F2] hover:text-white transition-all shadow-sm" title="Join our Discord">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
              </a>
              <a href="https://www.instagram.com/aiaazc/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-pink-600/10 text-pink-600 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all shadow-sm" title="Follow us on Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/projects" legacyBehavior><a className="hover:text-featured-green transition-colors">Projects</a></Link></li>
              <li><Link href="/opportunities" legacyBehavior><a className="hover:text-featured-green transition-colors">Opportunities</a></Link></li>
              <li><Link href="/tools" legacyBehavior><a className="hover:text-featured-green transition-colors">Resources</a></Link></li>
              <li><Link href="/privacy" legacyBehavior><a className="hover:text-featured-green transition-colors">Privacy Policy</a></Link></li>
              <li><Link href="/terms" legacyBehavior><a className="hover:text-featured-green transition-colors">Terms of Service</a></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Join Us</h4>
            <ul className="space-y-4">
              <li><Link href="/join" legacyBehavior><a className="hover:text-featured-green transition-colors">Membership</a></Link></li>
              <li><Link href="/contact" legacyBehavior><a className="hover:text-featured-green transition-colors">Contact</a></Link></li>
              <li><Link href="/admin" legacyBehavior><a className="hover:text-featured-green transition-colors">Admin Portal</a></Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            © {new Date().getFullYear()} AIAA Student Branch — Zewail City. All rights reserved.
          </div>
          <div className="text-sm text-white/50">
            Designed & Developed by AIAA ZC Team
          </div>
        </div>
      </div>
    </footer>
  )
}
