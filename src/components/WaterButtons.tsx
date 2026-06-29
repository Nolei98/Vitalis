'use client'
import { useTransition } from 'react'
import { addWater } from '@/app/actions/water'

export default function WaterButtons() {
  const [isPending, startTransition] = useTransition()
  
  return (
    <div className={`flex gap-4 mt-6 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      <button 
        onClick={() => startTransition(() => addWater(250))}
        className="clay-btn bg-[#a8e6cf] text-teal-900 font-bold px-6 py-4 flex-1 flex flex-col items-center justify-center gap-2"
      >
        <span className="text-2xl">💧</span>
        <span>+ 250ml</span>
      </button>
      <button 
        onClick={() => startTransition(() => addWater(500))}
        className="clay-btn bg-[#38bdf8] text-sky-950 font-bold px-6 py-4 flex-1 flex flex-col items-center justify-center gap-2"
      >
        <span className="text-2xl">🌊</span>
        <span>+ 500ml</span>
      </button>
    </div>
  )
}
