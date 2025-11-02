import React from 'react'
export default function Logo(){
  return (
    <div className="flex items-center gap-3">
      <img src="/aiaa-logo.png" alt="AIAA" className="w-16 md:w-48 h-auto" />
      <div className="h-8 border-l border-slate-200" />
      <img src="/zc-logo.png" alt="Zewail City" className="w-20 md:w-52 h-auto" />
    </div>
  )
}
