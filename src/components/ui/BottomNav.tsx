import React from 'react';
import { AppView } from '../../types';

interface BottomNavProps {
  current: AppView;
  onNavigate: (v: AppView) => void;
  onAdd: () => void;
}

type Item = { view: AppView; label: string; icon: React.ReactNode };

const icon = (paths: React.ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths}
  </svg>
);

const ITEMS_LEFT: Item[] = [
  { view: 'dashboard', label: 'Hoje', icon: icon(<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>) },
  { view: 'add-food', label: 'Buscar', icon: icon(<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>) },
];
const ITEMS_RIGHT: Item[] = [
  { view: 'recommendations', label: 'Receitas', icon: icon(<><path d="M12 3v18" /><path d="M5 8c0-2 2-4 7-4M19 8c0-2-2-4-7-4" /><path d="M5 8c0 6 3 9 7 9s7-3 7-9" /></>) },
  { view: 'profile', label: 'Perfil', icon: icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>) },
];

const NavButton: React.FC<{ item: Item; active: boolean; onClick: () => void }> = ({ item, active, onClick }) => (
  <button
    onClick={onClick}
    aria-label={item.label}
    aria-current={active ? 'page' : undefined}
    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-pill transition-all press ${active ? 'text-white bg-green-700 shadow-soft' : 'text-ink-soft hover:text-green-700'}`}
    style={{ borderRadius: 999 }}
  >
    {item.icon}
    <span className="text-[9px] font-extrabold uppercase tracking-wider">{item.label}</span>
  </button>
);

/** Navegação flutuante arredondada com FAB central laranja. */
const BottomNav: React.FC<BottomNavProps> = ({ current, onNavigate, onAdd }) => (
  <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(560px,calc(100%-24px))]">
    <div className="bottom-nav rounded-pill px-3 py-2.5 flex items-center justify-between" style={{ borderRadius: 999 }}>
      <div className="flex items-center gap-1">
        {ITEMS_LEFT.map(it => (
          <NavButton key={it.view} item={it} active={current === it.view} onClick={() => onNavigate(it.view)} />
        ))}
      </div>

      <button
        onClick={onAdd}
        aria-label="Registrar refeição"
        className="fab rounded-full flex items-center justify-center -mt-8 shadow-glow"
        style={{ width: 60, height: 60 }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex items-center gap-1">
        {ITEMS_RIGHT.map(it => (
          <NavButton key={it.view} item={it} active={current === it.view} onClick={() => onNavigate(it.view)} />
        ))}
      </div>
    </div>
  </nav>
);

export default BottomNav;
