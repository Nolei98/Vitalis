'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Droplets, Salad, BookOpen, Wallet, type LucideIcon } from 'lucide-react';

interface DockItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  mod: string;
}

const ITEMS: DockItem[] = [
  { href: '/agua',     label: 'Hidratação', Icon: Droplets, mod: 'agua' },
  { href: '/dieta',    label: 'Nutrição',   Icon: Salad,    mod: 'dieta' },
  { href: '/estudos',  label: 'YPT',        Icon: BookOpen, mod: 'estudos' },
  { href: '/financas', label: 'Finanças',   Icon: Wallet,   mod: 'financas' },
];

const HIDE_ON = ['/login', '/register'];

function DockButton({ item, active }: { item: DockItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      title={item.label}
      className="group relative flex items-center justify-center w-11 h-11 rounded-2xl transition-transform motion-safe:hover:scale-110 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background: active ? `var(--mod-${item.mod})` : 'var(--clay-surface)',
        boxShadow: active
          ? '0 4px 14px rgba(0,0,0,0.20)'
          : '0 2px 8px rgba(0,0,0,0.10), inset 1px 1px 2px rgba(255,255,255,0.6)',
        outlineColor: `var(--mod-${item.mod})`,
      }}
    >
      <item.Icon size={19} strokeWidth={2.2} color={active ? '#fff' : `var(--mod-${item.mod})`} />
      {/* Tooltip */}
      <span
        className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity motion-reduce:transition-none"
        style={{ background: 'var(--text-strong)', color: '#fff' }}
      >
        {item.label}
      </span>
    </Link>
  );
}

export default function RightDock() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;

  return (
    <>
      {/* Desktop: barra vertical fixa à direita */}
      <nav
        aria-label="Atalhos"
        className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-20 flex-col gap-2.5 p-2 rounded-3xl"
        style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      >
        {ITEMS.map((item) => (
          <DockButton key={item.href} item={item} active={pathname.startsWith(item.href)} />
        ))}
      </nav>

      {/* Mobile: cluster no canto inferior direito, acima da safe-area */}
      <nav
        aria-label="Atalhos"
        className="md:hidden fixed right-3 z-20 flex flex-col gap-2"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        {ITEMS.map((item) => (
          <DockButton key={item.href} item={item} active={pathname.startsWith(item.href)} />
        ))}
      </nav>
    </>
  );
}
