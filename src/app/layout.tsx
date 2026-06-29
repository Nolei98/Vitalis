import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ThemeApplier from "@/components/ThemeApplier";
import { getCurrentUser } from "@/lib/user";

const font = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "LifeOS",
  description: "Personal Life Operating System — Nolei Creative",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const firstName = (user.name || "você").split(" ")[0];

  return (
    <html lang="pt-BR">
      <body
        className={`${font.className} antialiased`}
        style={{ background: 'var(--app-bg)', color: 'var(--text-strong)' }}
      >
        <ThemeApplier />

        {/* ── Desktop: sidebar sticky + conteúdo flui naturalmente ─── */}
        <div className="hidden md:flex justify-center min-h-screen px-6 py-6">
          <div className="flex gap-6 w-full" style={{ maxWidth: 1400 }}>

            {/* Sidebar fica grudada enquanto o conteúdo rola */}
            <div className="sticky top-6 flex-shrink-0 self-start" style={{ height: 'calc(100vh - 3rem)' }}>
              <Sidebar userName={firstName} />
            </div>

            {/* Conteúdo: fluxo natural, sem scroll interno */}
            <main className="flex-1 min-w-0 flex flex-col">
              <div className="flex-1">
                {children}
              </div>
              <Footer />
            </main>

          </div>
        </div>

        {/* ── Mobile: topbar fixa + scroll normal da página ────────── */}
        <div className="md:hidden flex flex-col min-h-screen">
          <Sidebar userName={firstName} />
          <main className="flex-1 flex flex-col pt-14">
            <div className="flex-1 px-4 py-4">
              {children}
            </div>
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="flex-shrink-0 mt-6 border-t border-gray-100/60">
      {/* Mobile: centralizado */}
      <div className="md:hidden flex flex-col items-center gap-1 px-4 py-4 text-center">
        <div className="flex items-center gap-3">
          <a href="/termos" className="text-[11px] font-bold hover:underline" style={{ color: 'var(--text-soft)' }}>
            Termos de uso
          </a>
          <span style={{ color: 'var(--text-soft)', opacity: 0.4 }}>·</span>
          <span className="text-[11px] font-bold" style={{ color: 'var(--text-soft)' }}>
            Desenvolvido por <span style={{ color: 'var(--brand-500)' }}>Nolei Creative</span>
          </span>
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-soft)', opacity: 0.6 }}>
          © {new Date().getFullYear()} Nolei Creative · Todos os direitos reservados
        </p>
      </div>

      {/* Desktop: distribuído */}
      <div className="hidden md:flex items-center justify-between px-2 py-3">
        <p className="text-[11px] font-bold" style={{ color: 'var(--text-soft)' }}>
          © {new Date().getFullYear()} Nolei Creative · Todos os direitos reservados
        </p>
        <div className="flex items-center gap-3">
          <a href="/termos" className="text-[11px] font-bold hover:underline" style={{ color: 'var(--text-soft)' }}>
            Termos de uso
          </a>
          <span style={{ color: 'var(--text-soft)', opacity: 0.4 }}>·</span>
          <span className="text-[11px] font-bold" style={{ color: 'var(--text-soft)' }}>
            Desenvolvido por <span style={{ color: 'var(--brand-500)' }}>Nolei Creative</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
