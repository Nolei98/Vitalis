'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { logoutUser } from '@/app/actions/auth';
import UnreadBadge from '@/components/social/UnreadBadge';
import {
  LayoutDashboard, CalendarDays, CheckSquare,
  Target, AlarmClock, BarChart2, Users, ShieldCheck,
  Bell, Settings, Plug, LogOut, Menu, X, MessageCircle, Sparkles,
} from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  iconBg: string;
  accent: string;
  accentBg: string;
}

const LINKS: NavLink[] = [
  { href: '/',              label: 'Dashboard',    Icon: LayoutDashboard, iconBg: 'linear-gradient(135deg,#6D49E8,#9871F5)', accent: '#7C5CFC', accentBg: '#EDE8FF' },
  { href: '/agenda',        label: 'Agenda',       Icon: CalendarDays,    iconBg: 'linear-gradient(135deg,#3A6BCF,#5B8DEF)', accent: '#5B8DEF', accentBg: '#E5EFFD' },
  { href: '/tarefas',       label: 'Tarefas',      Icon: CheckSquare,     iconBg: 'linear-gradient(135deg,#1A9E6E,#2BC48A)', accent: '#2BC48A', accentBg: '#E0F7EE' },
  { href: '/metas',         label: 'Metas',        Icon: Target,          iconBg: 'linear-gradient(135deg,#D94C91,#FF6FB5)', accent: '#FF6FB5', accentBg: '#FFE9F4' },
  { href: '/alarmes',       label: 'Alarmes',      Icon: AlarmClock,      iconBg: 'linear-gradient(135deg,#CC8800,#FFB020)', accent: '#FFB020', accentBg: '#FFF6DC' },
  { href: '/relatorios',    label: 'Insights',     Icon: BarChart2,       iconBg: 'linear-gradient(135deg,#0D9488,#14B8A6)', accent: '#14B8A6', accentBg: '#E0F7F5' },
  { href: '/social',        label: 'Social',       Icon: MessageCircle,   iconBg: 'linear-gradient(135deg,#B020C8,#D946EF)', accent: '#D946EF', accentBg: '#FDE7FF' },
  { href: '/usuarios',      label: 'Usuários',     Icon: ShieldCheck,     iconBg: 'linear-gradient(135deg,#7C5CFC,#A78BFA)', accent: '#A78BFA', accentBg: '#EDE8FF' },
  { href: '/notificacoes',  label: 'Notificações', Icon: Bell,            iconBg: 'linear-gradient(135deg,#D94060,#FB7185)', accent: '#FB7185', accentBg: '#FFE5E9' },
  { href: '/configuracoes', label: 'Config',       Icon: Settings,        iconBg: 'linear-gradient(135deg,#64748B,#94A3B8)', accent: '#94A3B8', accentBg: '#F8FAFC' },
  { href: '/conexoes',      label: 'Conexões',     Icon: Plug,            iconBg: 'linear-gradient(135deg,#475569,#64748B)', accent: '#64748B', accentBg: '#F1F5F9' },
];

const HIDE_ON = ['/login', '/register'];

const SIDEBAR_STYLE = {
  background: 'linear-gradient(160deg, var(--sidebar-from, #6D49E8) 0%, var(--sidebar-mid, #9871F5) 60%, var(--sidebar-to, #B794FF) 100%)',
  boxShadow: '0 18px 40px -10px rgba(108,76,252,0.40), inset 2px 2px 6px rgba(255,255,255,0.20)',
};

function NavItem({ l, active, onNavigate }: { l: NavLink; active: boolean; onNavigate?: () => void }) {
  return (
    <a
      href={l.href}
      onClick={onNavigate}
      className="flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-150 font-semibold text-[13px] relative group"
      style={
        active
          ? { background: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 800, backdropFilter: 'blur(8px)' }
          : { color: 'rgba(255,255,255,0.75)' }
      }
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {/* Icon com gradiente temático */}
      <span
        className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 relative transition-all duration-150"
        style={{
          background: active ? l.iconBg : 'rgba(255,255,255,0.12)',
          boxShadow: active ? '0 2px 8px rgba(0,0,0,0.20)' : 'none',
        }}
      >
        <l.Icon size={14} strokeWidth={2.2} className="text-white" />
        {l.href === '/social' && <UnreadBadge />}
      </span>
      <span className="truncate">{l.label}</span>
      {/* Pill de ativo */}
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-80 flex-shrink-0" />
      )}
    </a>
  );
}

function NavItems({ pathname, isAdmin, onNavigate }: { pathname: string; isAdmin?: boolean; onNavigate?: () => void }) {
  const links = isAdmin ? LINKS : LINKS.filter((l) => l.href !== '/usuarios');
  return (
    <>
      <nav className="w-full px-3 space-y-0.5 flex-1 overflow-y-auto no-scrollbar">
        {links.map((l) => {
          const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
          return <NavItem key={l.href} l={l} active={active} onNavigate={onNavigate} />;
        })}
      </nav>

      <form action={logoutUser} className="w-full px-3 mt-2 flex-shrink-0">
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-150 font-semibold text-[13px]"
          style={{ color: 'rgba(255,255,255,0.60)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.10)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <span className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.10)' }}>
            <LogOut size={14} strokeWidth={2.2} className="text-white/70" />
          </span>
          Sair
        </button>
      </form>
    </>
  );
}

export default function Sidebar({ userName, isAdmin }: { userName: string; isAdmin?: boolean }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────────────── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4 gap-3"
        style={SIDEBAR_STYLE}
      >
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)' }}
          aria-label="Menu"
        >
          <Menu size={18} className="text-white" />
        </button>

        {/* Logo centralizada na topbar */}
        <div className="flex-1 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.20)' }}>
            <img src="https://i.imgur.com/5MU9NOg.png" alt="Vitalis" width={20} height={20} />
          </div>
          <span className="text-white font-black text-sm">Vitalis</span>
        </div>

        {/* Sem ícones duplicados — notif e social ficam só no menu drawer */}
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="relative w-72 max-w-[85vw] h-full flex flex-col py-6 overflow-hidden"
            style={{ ...SIDEBAR_STYLE, borderRadius: '0 28px 28px 0' }}
          >
            {/* Logo + user + fechar */}
            <div className="flex items-center justify-between px-4 mb-5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.18)' }}>
                  <img src="https://i.imgur.com/5MU9NOg.png" alt="Vitalis" width={28} height={28} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Olá, {userName}! <Sparkles size={13} className="inline-block text-yellow-200 ml-0.5" strokeWidth={2} /></p>
                  <p className="text-white/60 text-xs font-semibold">Vitalis</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.12)' }}
              >
                <X size={16} className="text-white/80" />
              </button>
            </div>
            <NavItems pathname={pathname} isAdmin={isAdmin} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex w-[220px] flex-shrink-0 flex-col items-center py-6 h-full"
        style={{ ...SIDEBAR_STYLE, borderRadius: 32 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-5 flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1.5"
            style={{ background: 'rgba(255,255,255,0.18)' }}>
            <img src="https://i.imgur.com/5MU9NOg.png" alt="Vitalis" width={40} height={40} />
          </div>
          <p className="text-white font-bold text-sm opacity-90">Olá, {userName}! <Sparkles size={13} className="inline-block text-yellow-200 ml-0.5" strokeWidth={2} /></p>
        </div>

        <NavItems pathname={pathname} isAdmin={isAdmin} />
      </aside>
    </>
  );
}
