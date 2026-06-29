'use client';

import { usePathname } from 'next/navigation';
import { logoutUser } from '@/app/actions/auth';

const LINKS: { href: string; label: string }[] = [
  { href: '/', label: '🏠 Dashboard' },
  { href: '/agenda', label: '📅 Agenda' },
  { href: '/tarefas', label: '✅ Tarefas' },
  { href: '/dieta', label: '🥗 Dieta' },
  { href: '/agua', label: '💧 Hidratação' },
  { href: '/financas', label: '💰 Finanças' },
  { href: '/metas', label: '🎯 Metas' },
  { href: '/alarmes', label: '⏰ Alarmes' },
  { href: '/relatorios', label: '📊 Relatórios' },
  { href: '/usuarios', label: '👥 Usuários' },
  { href: '/notificacoes', label: '🔔 Notificações' },
  { href: '/configuracoes', label: '⚙️ Ajustes' },
  { href: '/conexoes', label: '🔌 Conexões' },
];

const HIDE_ON = ['/login', '/register'];

export default function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;

  return (
    <aside className="clay-panel w-64 flex-shrink-0 flex flex-col items-center py-8 text-white hidden md:flex h-full">
      <div className="w-20 h-20 rounded-full bg-white/20 mb-4 p-1 shadow-inner">
        <div className="w-full h-full rounded-full bg-indigo-300 overflow-hidden flex items-center justify-center text-3xl">
          👦🏻
        </div>
      </div>
      <h2 className="text-xl font-bold mb-6 text-white">Olá, {userName}! 👋</h2>

      <nav className="w-full px-4 space-y-2 flex-1 overflow-y-auto no-scrollbar">
        {LINKS.map((l) => {
          const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
          return (
            <a
              key={l.href}
              href={l.href}
              className={
                active
                  ? 'bg-white text-[#9871F5] shadow-[inset_0px_-4px_0px_rgba(0,0,0,0.1),_0px_4px_10px_rgba(0,0,0,0.15)] block px-4 py-3 font-extrabold text-center rounded-2xl transform active:scale-95 transition-all'
                  : 'block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95'
              }
            >
              {l.label}
            </a>
          );
        })}
      </nav>

      <form action={logoutUser} className="w-full px-4 mt-3">
        <button
          type="submit"
          className="w-full block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95"
        >
          🚪 Sair
        </button>
      </form>
    </aside>
  );
}
