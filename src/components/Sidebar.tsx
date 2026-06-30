'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { logoutUser } from '@/app/actions/auth';
import UnreadBadge from '@/components/social/UnreadBadge';

interface NavLink {
  href: string;
  label: string;
  icon: string;
  accent: string;
  accentBg: string;
}

const LINKS: NavLink[] = [
  { href: '/',              label: 'Dashboard',    icon: '🏠', accent: '#7C5CFC', accentBg: '#EDE8FF' },
  { href: '/agenda',        label: 'Agenda',       icon: '📅', accent: '#5B8DEF', accentBg: '#E5EFFD' },
  { href: '/tarefas',       label: 'Tarefas',      icon: '✅', accent: '#2BC48A', accentBg: '#E0F7EE' },
  { href: '/dieta',         label: 'Nutri',        icon: '🥗', accent: '#FF8A5B', accentBg: '#FFF0E9' },
  { href: '/agua',          label: 'Hidro',        icon: '💧', accent: '#36C5F0', accentBg: '#E2F7FC' },
  { href: '/financas',      label: 'Finanças',     icon: '💰', accent: '#8B5CF6', accentBg: '#EDE9FE' },
  { href: '/metas',         label: 'Metas',        icon: '🎯', accent: '#FF6FB5', accentBg: '#FFE9F4' },
  { href: '/alarmes',       label: 'Alarmes',      icon: '⏰', accent: '#FFB020', accentBg: '#FFF6DC' },
  { href: '/relatorios',    label: 'Insights',     icon: '📊', accent: '#14B8A6', accentBg: '#E0F7F5' },
  { href: '/social',        label: 'Social',       icon: '🤝', accent: '#D946EF', accentBg: '#FDE7FF' },
  { href: '/usuarios',      label: 'Usuários',     icon: '👥', accent: '#A78BFA', accentBg: '#EDE8FF' },
  { href: '/notificacoes',  label: 'Notificações', icon: '🔔', accent: '#FB7185', accentBg: '#FFE5E9' },
  { href: '/configuracoes', label: 'Config',       icon: '⚙️', accent: '#94A3B8', accentBg: '#F8FAFC' },
  { href: '/conexoes',      label: 'Connect',      icon: '🔌', accent: '#64748B', accentBg: '#F1F5F9' },
];

const HIDE_ON = ['/login', '/register'];

const SIDEBAR_STYLE = {
  background: 'linear-gradient(160deg, var(--sidebar-from, #6D49E8) 0%, var(--sidebar-mid, #9871F5) 60%, var(--sidebar-to, #B794FF) 100%)',
  boxShadow: '0 18px 40px -10px rgba(108,76,252,0.40), inset 2px 2px 6px rgba(255,255,255,0.25)',
};

function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <nav className="w-full px-3 space-y-0.5 flex-1 overflow-y-auto no-scrollbar">
        {LINKS.map((l) => {
          const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
          return (
            <a
              key={l.href}
              href={l.href}
              onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 font-semibold text-[13px]"
              style={
                active
                  ? { background: 'var(--clay-surface-2)', color: l.accent, boxShadow: 'var(--clay-shadow-btn)', fontWeight: 800 }
                  : { color: 'rgba(255,255,255,0.82)' }
              }
              onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span
                className="w-7 h-7 rounded-xl flex items-center justify-center text-base flex-shrink-0 relative"
                style={active ? { background: l.accentBg } : {}}
              >
                {l.icon}
                {l.href === '/social' && <UnreadBadge />}
              </span>
              {l.label}
            </a>
          );
        })}
      </nav>

      <form action={logoutUser} className="w-full px-3 mt-2 flex-shrink-0">
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 font-semibold text-[13px]"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <span className="w-7 h-7 rounded-xl flex items-center justify-center text-base">🚪</span>
          Sair
        </button>
      </form>
    </>
  );
}

export default function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // close drawer on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;

  const activeLink = LINKS.find((l) => l.href === '/' ? pathname === '/' : pathname.startsWith(l.href));

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────────── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4 gap-3"
        style={SIDEBAR_STYLE}
      >
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)' }}
          aria-label="Menu"
        >
          ☰
        </button>

        <div className="flex-1 flex items-center gap-2">
          <img src="https://i.imgur.com/5MU9NOg.png" alt="Vitalis" width={28} height={28}
            style={{ filter: 'brightness(0) invert(1)' }} />
          {activeLink && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)' }}>
              {activeLink.icon} {activeLink.label}
            </span>
          )}
        </div>

        <a href="/social" className="w-9 h-9 rounded-2xl flex items-center justify-center relative"
          style={{ background: 'rgba(255,255,255,0.15)' }}>
          <span className="text-base">💬</span>
          <UnreadBadge />
        </a>
        <a href="/notificacoes" className="w-9 h-9 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)' }}>
          <span className="text-base">🔔</span>
        </a>
      </header>

      {/* ── Mobile drawer overlay ───────────────────────────────────────── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <aside
            className="relative w-72 max-w-[85vw] h-full flex flex-col py-6 overflow-hidden"
            style={{ ...SIDEBAR_STYLE, borderRadius: '0 28px 28px 0' }}
          >
            {/* Close + logo + user */}
            <div className="flex items-center justify-between px-4 mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <img src="https://i.imgur.com/5MU9NOg.png" alt="Vitalis" width={40} height={40}
                  className="rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.18)', padding: 4, filter: 'brightness(0) invert(1)' }} />
                <div>
                  <p className="text-white font-bold text-sm">Olá, {userName}! 👋</p>
                  <p className="text-white/60 text-xs font-semibold">Vitalis</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/80 text-lg"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              >
                ✕
              </button>
            </div>

            <NavItems pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex w-[220px] flex-shrink-0 flex-col items-center py-6 h-full"
        style={{ ...SIDEBAR_STYLE, borderRadius: 32 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-4 flex-shrink-0">
          <img
            src="https://i.imgur.com/5MU9NOg.png"
            alt="Vitalis"
            width={52}
            height={52}
            className="mb-1"
            style={{ filter: 'brightness(0) invert(1)', opacity: 0.95 }}
          />
          <p className="text-white font-bold text-sm opacity-90">Olá, {userName}! 👋</p>
        </div>

        <NavItems pathname={pathname} />
      </aside>
    </>
  );
}
