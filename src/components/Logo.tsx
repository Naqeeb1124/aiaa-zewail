import React from 'react'
export default function Logo({ size = 48 }: { size?: number }){
  return (
    <div className="flex items-center gap-3">
      <img src="/aiaa-logo.png" alt="AIAA" style={{ width: size, height: 'auto' }} />
      <div className="h-8 border-l border-slate-200" />
      <img src="/zc-logo.png" alt="Zewail City" style={{ width: size + 8, height: size + 8 }} />
    </div>
  )
}
