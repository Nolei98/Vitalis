'use client';

import { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { THEMES } from '@/lib/themes';

export default function ThemePicker() {
  const [active, setActive] = useState('violet');

  useEffect(() => {
    const saved = localStorage.getItem('lifeos_theme');
    if (saved) setActive(saved);
  }, []);

  function apply(id: string) {
    const theme = THEMES.find((t) => t.id === id);
    if (!theme) return;
    setActive(id);
    localStorage.setItem('lifeos_theme', id);
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }

  return (
    <div className="clay-card p-6 space-y-4" style={{ borderTop: '3px solid var(--brand-500)' }}>
      <div className="flex items-center gap-3 mb-2">
        <span className="w-9 h-9 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--brand-100)' }}>
          <Palette size={18} strokeWidth={2} style={{ color: 'var(--brand-500)' }} />
        </span>
        <div>
          <h2 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Cor do App</h2>
          <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>
            Escolha o tema visual do Vitalis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {THEMES.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => apply(t.id)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all"
              style={{
                background: isActive ? `${t.preview}18` : 'var(--clay-surface)',
                outline: isActive ? `2.5px solid ${t.preview}` : '2px solid transparent',
                boxShadow: isActive ? `0 4px 16px ${t.preview}30` : 'none',
              }}
            >
              {/* Swatch */}
              <div
                className="w-10 h-10 rounded-xl shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${t.vars['--sidebar-from']}, ${t.vars['--sidebar-to']})`,
                }}
              />
              <span className="text-[11px] font-bold" style={{ color: isActive ? t.preview : 'var(--text-soft)' }}>
                {t.label}
              </span>
              {isActive && (
                <span className="text-[10px] font-black" style={{ color: t.preview }}>✓ ativo</span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] font-bold" style={{ color: 'var(--text-soft)' }}>
        A cor é salva no navegador e aplicada em todas as sessões.
      </p>
    </div>
  );
}
