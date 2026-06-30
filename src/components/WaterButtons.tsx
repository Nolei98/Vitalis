'use client'
import { useTransition } from 'react'
import { addWater } from '@/app/actions/water'
import { Droplet, Droplets } from 'lucide-react'

export default function WaterButtons() {
  const [isPending, startTransition] = useTransition()

  return (
    <div className={`flex flex-col gap-1.5 w-full ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      <button
        onClick={() => startTransition(() => addWater(250))}
        className="clay-btn font-bold px-3 py-1.5 w-full flex items-center justify-center gap-2 text-xs transition-all hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg,#1AA3CC,#36C5F0)', color: 'white', boxShadow: '0 2px 8px rgba(26,163,204,0.30)' }}
      >
        <Droplet size={14} strokeWidth={2.2} />
        <span>+ 250ml</span>
      </button>
      <button
        onClick={() => startTransition(() => addWater(500))}
        className="clay-btn font-bold px-3 py-1.5 w-full flex items-center justify-center gap-2 text-xs transition-all hover:scale-[1.02]"
        style={{ background: 'linear-gradient(135deg,#0E7EA8,#1AA3CC)', color: 'white', boxShadow: '0 2px 8px rgba(14,126,168,0.30)' }}
      >
        <Droplets size={14} strokeWidth={2.2} />
        <span>+ 500ml</span>
      </button>
    </div>
  )
}
