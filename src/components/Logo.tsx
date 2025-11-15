import React from 'react'
export default function Logo({ scrolled }: { scrolled?: boolean }){
  const aiaaLogoSize = scrolled ? 'w-16 md:w-24' : 'w-16 md:w-48';
  const zcLogoSize = scrolled ? 'w-20 md:w-24' : 'w-20 md:w-52';

  return (
    <div className="flex items-center gap-3">
      <img src="/aiaa-logo.png" alt="AIAA" className={`${aiaaLogoSize} h-auto logo-white transition-all duration-300`} />
      <div className="h-8 border-l border-slate-200" />
      <img src="/zc-logo.png" alt="Zewail City" className={`${zcLogoSize} h-auto logo-white transition-all duration-300`} />
    </div>
  )
}
