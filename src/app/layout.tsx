import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
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
        {/*
          Mobile: full-screen column (top bar fixed, content scrolls below it).
          Desktop: flex centering — app is a "window" centered on screen.
        */}

        {/* ── Desktop centering shell ─────────────────────────────────── */}
        <div className="
          hidden md:flex
          min-h-screen items-center justify-center
          p-6
        ">
          <div
            className="flex gap-6 w-full"
            style={{ maxWidth: 1400, height: 'min(900px, calc(100vh - 3rem))' }}
          >
            <Sidebar userName={firstName} />

            {/* Content + footer scrolled together */}
            <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar rounded-[32px] flex flex-col">
              <div className="flex-1 p-4 pr-6">
                {children}
              </div>
              <Footer />
            </main>
          </div>
        </div>

        {/* ── Mobile full-screen layout ───────────────────────────────── */}
        <div className="flex flex-col min-h-screen md:hidden">
          <Sidebar userName={firstName} />

          {/* Content starts below the fixed 56px top bar */}
          <main className="flex-1 flex flex-col overflow-y-auto pt-14">
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
    <footer className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 px-4 py-3 mt-4 border-t border-gray-100/60">
      <p className="text-[11px] font-bold" style={{ color: 'var(--text-soft)' }}>
        © {new Date().getFullYear()} Nolei Creative · Todos os direitos reservados
      </p>
      <div className="flex items-center gap-3">
        <a href="/termos" className="text-[11px] font-bold hover:underline" style={{ color: 'var(--text-soft)' }}>
          Termos de uso
        </a>
        <span style={{ color: 'var(--text-soft)', opacity: 0.4 }}>·</span>
        <span className="text-[11px] font-bold" style={{ color: 'var(--text-soft)' }}>
          Desenvolvido por{' '}
          <span style={{ color: 'var(--brand-500)' }}>Nolei Creative</span>
        </span>
      </div>
    </footer>
  );
}
