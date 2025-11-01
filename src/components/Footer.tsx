export default function Footer(){
  return (
    <footer className="py-8 bg-slate-100 mt-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm">© {new Date().getFullYear()} AIAA Student Branch — Zewail City</div>
        <div className="text-sm">Built with ❤️ — For demonstration</div>
      </div>
    </footer>
  )
}
