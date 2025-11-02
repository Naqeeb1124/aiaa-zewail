import Logo from './Logo'

export default function Footer(){
  return (
    <footer className="py-8 bg-slate-100 mt-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col items-center md:items-start">
          <Logo />
          <div className="mt-4 text-center md:text-left">
            <div className="font-bold">AIAA Zewail City</div>
            <div className="text-sm text-slate-600">
              <div>Ahmed Zewail Road</div>
              <div>October Gardens</div>
              <div>6th of October City</div>
              <div>Giza, Egypt</div>
            </div>
          </div>
        </div>
        <div className="text-sm mt-8 text-center">
          © {new Date().getFullYear()} AIAA Student Branch — Zewail City
        </div>
      </div>
    </footer>
  )
}
