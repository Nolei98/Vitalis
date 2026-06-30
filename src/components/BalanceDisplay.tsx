'use client'
import { useState, useEffect } from 'react'

interface Props {
  balance: number
  size?: 'large' | 'small'
  /** 'dark' = fundo escuro (texto branco). 'light' = fundo claro (texto colorido). */
  variant?: 'dark' | 'light'
}

export default function BalanceDisplay({ balance, size = 'large', variant = 'dark' }: Props) {
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
  const isLight = variant === 'light'

  const textColor = isLight ? 'var(--mod-financas)' : 'white'
  const subColor = isLight ? 'var(--text-soft)' : 'rgba(255,255,255,0.6)'
  const btnBg = isLight ? 'var(--mod-financas-bg)' : 'rgba(255,255,255,0.12)'

  if (size === 'small') {
    return (
      <div className="flex items-center gap-2">
        <p className="text-2xl font-black mt-1" style={{ color: textColor }}>
          {isVisible ? formatted : hidden}
        </p>
        <button
          onClick={toggle}
          className="text-lg mt-1 transition-opacity hover:opacity-80"
          style={{ color: subColor }}
        >
          {isVisible ? '🙈' : '👁️'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="block text-4xl font-extrabold" style={{ color: textColor }}>
        {isVisible ? formatted : hidden}
      </span>
      <button
        onClick={toggle}
        className="text-xl w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
        style={{ background: btnBg, color: subColor }}
      >
        {isVisible ? '🙈' : '👁️'}
      </button>
    </div>
  )
}
