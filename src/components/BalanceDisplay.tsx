'use client'
import { useState, useEffect } from 'react'

export default function BalanceDisplay({ balance, size = 'large' }: { balance: number, size?: 'large' | 'small' }) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const saved = localStorage.getItem('lifeos_balance_visible')
    if (saved) setIsVisible(saved === 'true')
  }, [])

  const toggle = () => {
    const next = !isVisible
    setIsVisible(next)
    localStorage.setItem('lifeos_balance_visible', String(next))
  }

  const formatted = `R$ ${balance.toFixed(2).replace('.', ',')}`
  const hidden = 'R$ •••••'

  if (size === 'small') {
    return (
      <div className="flex items-center gap-2">
        <p className="text-3xl font-black text-white mt-1">{isVisible ? formatted : hidden}</p>
        <button onClick={toggle} className="text-white/60 hover:text-white transition-colors mt-1 text-lg">
          {isVisible ? '🙈' : '👁️'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="block text-4xl font-extrabold">{isVisible ? formatted : hidden}</span>
      <button onClick={toggle} className="text-white/60 hover:text-white transition-colors text-xl bg-white/10 w-10 h-10 rounded-full flex items-center justify-center">
        {isVisible ? '🙈' : '👁️'}
      </button>
    </div>
  )
}
