'use client';

import { usePathname } from 'next/navigation';
import { logoutUser } from '@/app/actions/auth';

interface NavLink {
  href: string;
  label: string;
  icon: string;
  accent: string;
  accentBg: string;
}

const LINKS: NavLink[] = [
  { href: '/',              label: 'Dashboard',   icon: '🏠', accent: '#7C5CFC', accentBg: '#EDE8FF' },
  { href: '/agenda',        label: 'Agenda',      icon: '📅', accent: '#5B8DEF', accentBg: '#E5EFFD' },
  { href: '/tarefas',       label: 'Tarefas',     icon: '✅', accent: '#2BC48A', accentBg: '#E0F7EE' },
  { href: '/dieta',         label: 'Dieta',       icon: '🥗', accent: '#FF8A5B', accentBg: '#FFF0E9' },
  { href: '/agua',          label: 'Hidratação',  icon: '💧', accent: '#36C5F0', accentBg: '#E2F7FC' },
  { href: '/financas',      label: 'Finanças',    icon: '💰', accent: '#8B5CF6', accentBg: '#EDE9FE' },
  { href: '/metas',         label: 'Metas',       icon: '🎯', accent: '#FF6FB5', accentBg: '#FFE9F4' },
  { href: '/alarmes',       label: 'Alarmes',     icon: '⏰', accent: '#FFB020', accentBg: '#FFF6DC' },
  { href: '/relatorios',    label: 'Relatórios',  icon: '📊', accent: '#14B8A6', accentBg: '#E0F7F5' },
  { href: '/usuarios',      label: 'Usuários',    icon: '👥', accent: '#A78BFA', accentBg: '#EDE8FF' },
  { href: '/notificacoes',  label: 'Notificações',icon: '🔔', accent: '#FB7185', accentBg: '#FFE5E9' },
  { href: '/configuracoes', label: 'Ajustes',     icon: '⚙️', accent: '#94A3B8', accentBg: '#F8FAFC' },
  { href: '/conexoes',      label: 'Conexões',    icon: '🔌', accent: '#64748B', accentBg: '#F1F5F9' },
];

const HIDE_ON = ['/login', '/register'];

export default function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col items-center py-6 hidden md:flex h-full"
      style={{
        background: 'linear-gradient(160deg, #6D49E8 0%, #9871F5 60%, #B794FF 100%)',
        borderRadius: 32,
        boxShadow: '0 18px 40px -10px rgba(108,76,252,0.40), inset 2px 2px 6px rgba(255,255,255,0.25)',
      }}
    >
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full mb-1 flex items-center justify-center text-3xl"
        style={{ background: 'rgba(255,255,255,0.18)', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.12)' }}>
        👦🏻
      </div>
      <p className="text-white font-bold text-sm mb-5 opacity-90">Olá, {userName}! 👋</p>

      {/* Nav */}
      <nav className="w-full px-3 space-y-1 flex-1 overflow-y-auto no-scrollbar">
        {LINKS.map((l) => {
          const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
          return (
            <a
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 font-semibold text-[13px]"
              style={
                active
                  ? {
                      background: 'rgba(255,255,255,0.95)',
                      color: l.accent,
                      boxShadow: `0 4px 12px rgba(0,0,0,0.12), 0 0 0 1px ${l.accent}22`,
                      fontWeight: 800,
                    }
                  : {
                      color: 'rgba(255,255,255,0.82)',
                    }
              }
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <span
                className="w-7 h-7 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-all"
                style={active ? { background: l.accentBg } : {}}
              >
                {l.icon}
              </span>
              {l.label}
            </a>
          );
        })}
      </nav>

      {/* Logout */}
      <form action={logoutUser} className="w-full px-3 mt-2">
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
    </aside>
  );
}
