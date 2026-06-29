import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/user";

const font = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "LifeOS",
  description: "Personal Life Operating System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const firstName = (user.name || "você").split(" ")[0];

  return (
    <html lang="pt-BR">
      <body className={`${font.className} antialiased flex flex-col h-screen p-4 md:p-6 overflow-hidden`} style={{ background: 'var(--app-bg)', color: 'var(--text-strong)' }}>
        {/* Centered container wrapper */}
        <div className="flex gap-6 w-full max-w-[1400px] mx-auto flex-1 min-h-0 max-h-[900px]">

          <Sidebar userName={firstName} />

          {/* Main Content */}
          <main className="flex-1 w-full overflow-y-auto h-full rounded-[32px] p-2 pr-6 no-scrollbar relative">
            {children}
          </main>

        </div>

        {/* Footer */}
        <footer className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-4 pt-2 pb-0.5">
          <p className="text-[11px] font-bold" style={{ color: 'var(--text-soft)' }}>
            © {new Date().getFullYear()} Nolei Creative · Todos os direitos reservados
          </p>
          <div className="flex items-center gap-3">
            <a href="/termos" className="text-[11px] font-bold hover:underline" style={{ color: 'var(--text-soft)' }}>
              Termos de uso
            </a>
            <span style={{ color: 'var(--text-soft)', opacity: 0.4 }}>·</span>
            <span className="text-[11px] font-bold" style={{ color: 'var(--text-soft)', opacity: 0.7 }}>
              Desenvolvido por <span style={{ color: 'var(--brand-500)' }}>Nolei Creative</span>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
