import React from "react";
import Sidebar from "@/components/Sidebar";
import RightDock from "@/components/RightDock";
import { getCurrentUser } from "@/lib/user";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let firstName = 'você';
  let isAdmin = false;
  try {
    const user = await getCurrentUser();
    firstName = (user.name || 'você').split(' ')[0];
    isAdmin =
      user.role === 'admin' ||
      !!(process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL);
  } catch {
    // fallback
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <RightDock />

      {/* ── Desktop: viewport fixo, sem scroll no browser ────────── */}
      <div className="hidden md:flex h-full justify-center px-6 py-6">
        <div className="flex gap-6 w-full h-full" style={{ maxWidth: 1400 }}>

          {/* Sidebar: altura total, não rola */}
          <div className="flex-shrink-0 h-full">
            <Sidebar userName={firstName} isAdmin={isAdmin} />
          </div>

          {/* Área de conteúdo */}
          <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden pr-16">
            <div className="flex-1 overflow-y-auto no-scrollbar px-1 pb-2">
              {children}
            </div>
            <AppFooter />
          </main>

        </div>
      </div>

      {/* ── Mobile: topbar fixa + scroll normal ──────────────────── */}
      <div className="md:hidden flex flex-col h-full overflow-hidden">
        <Sidebar userName={firstName} isAdmin={isAdmin} />
        <main className="flex-1 flex flex-col overflow-hidden pt-14">
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4">
            {children}
          </div>
          <AppFooter />
        </main>
      </div>
    </div>
  );
}

function AppFooter() {
  return (
    <footer className="flex-shrink-0 border-t border-black/5 px-2 py-2">
      {/* Mobile: centralizado */}
      <div className="md:hidden flex flex-col items-center gap-0.5 text-center">
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <a href="/termos" className="text-[10px] font-bold hover:underline" style={{ color: 'var(--text-soft)' }}>
            Termos de uso
          </a>
          <span style={{ color: 'var(--text-soft)', opacity: 0.4 }}>·</span>
          <span className="text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>
            Desenvolvido por{' '}
            <a href="https://portfolio-jr-lilac.vercel.app/?lang=pt" target="_blank" rel="noopener noreferrer"
              className="hover:underline" style={{ color: 'var(--brand-500)' }}>João Rodrigues</a>
          </span>
        </div>
        <p className="text-[9px]" style={{ color: 'var(--text-soft)', opacity: 0.5 }}>
          © {new Date().getFullYear()} Vitalis
        </p>
      </div>

      {/* Desktop: distribuído */}
      <div className="hidden md:flex items-center justify-between">
        <p className="text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>
          © {new Date().getFullYear()} Vitalis · Todos os direitos reservados
        </p>
        <div className="flex items-center gap-2">
          <a href="/termos" className="text-[10px] font-bold hover:underline" style={{ color: 'var(--text-soft)' }}>
            Termos de uso
          </a>
          <span style={{ color: 'var(--text-soft)', opacity: 0.4 }}>·</span>
          <span className="text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>
            Desenvolvido por{' '}
            <a href="https://portfolio-jr-lilac.vercel.app/?lang=pt" target="_blank" rel="noopener noreferrer"
              className="hover:underline" style={{ color: 'var(--brand-500)' }}>João Rodrigues</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
