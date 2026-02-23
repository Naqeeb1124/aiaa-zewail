import React from 'react'
import Image from 'next/image'

export default function Logo({ scrolled }: { scrolled?: boolean }){
  const aiaaLogoWidth = scrolled ? 96 : 192; // 24*4 and 48*4 roughly
  const zcLogoWidth = scrolled ? 96 : 208; // 24*4 and 52*4 roughly

  return (
    <div className="flex items-center gap-3">
      <div className={`${scrolled ? 'w-16 md:w-24' : 'w-16 md:w-48'} transition-all duration-300 relative aspect-[150/40] h-auto`}>
        <Image 
            src="/aiaa-logo.png" 
            alt="AIAA" 
            fill
            className="object-contain"
        />
      </div>
      <div className="h-8 border-l border-slate-200" />
      <div className={`${scrolled ? 'w-20 md:w-24' : 'w-20 md:w-52'} transition-all duration-300 relative aspect-[120/40] h-auto`}>
        <Image 
            src="/zc-logo.png" 
            alt="Zewail City" 
            fill
            className="object-contain"
        />
      </div>
    </div>
  )
}
