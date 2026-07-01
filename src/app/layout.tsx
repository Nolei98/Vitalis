import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import RightDock from "@/components/RightDock";
import { getCurrentUser } from "@/lib/user";

const font = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: {
    default: "Vitalis — Seu sistema pessoal de bem-estar",
    template: "%s · Vitalis",
  },
  description: "Vitalis é o seu sistema pessoal de bem-estar. Gerencie nutrição, hidratação, finanças, agenda, tarefas e metas em um só lugar.",
  keywords: ["bem-estar", "saúde", "nutrição", "finanças pessoais", "produtividade", "vitalis", "nolei creative"],
  authors: [{ name: "Nolei Creative" }],
  creator: "Nolei Creative",
  openGraph: {
    title: "Vitalis — Seu sistema pessoal de bem-estar",
    description: "Gerencie nutrição, hidratação, finanças, agenda, tarefas e metas em um só lugar.",
    url: "https://vitalis.vercel.app",
    siteName: "Vitalis",
    images: [
      {
        url: "https://i.imgur.com/5MU9NOg.png",
        width: 512,
        height: 512,
        alt: "Vitalis — logo",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vitalis — Seu sistema pessoal de bem-estar",
    description: "Gerencie nutrição, hidratação, finanças, agenda, tarefas e metas em um só lugar.",
    images: ["https://i.imgur.com/5MU9NOg.png"],
  },
  icons: {
    icon: "https://i.imgur.com/5MU9NOg.png",
  },
};

// Inline script aplica tema do localStorage ANTES do primeiro paint (zero flash)
// Themes only change sidebar/brand colors — clay surface (#ECE9E2) is always universal
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('lifeos_theme');if(!t)return;var m={violet:{'--brand-600':'#6D49E8','--brand-500':'#7C5CFC','--brand-400':'#9871F5','--brand-300':'#B7A6FF','--brand-100':'#EDE8FF','--sidebar-from':'#6D49E8','--sidebar-mid':'#9871F5','--sidebar-to':'#B794FF'},ocean:{'--brand-600':'#1D4ED8','--brand-500':'#2563EB','--brand-400':'#3B82F6','--brand-300':'#93C5FD','--brand-100':'#DBEAFE','--sidebar-from':'#1D4ED8','--sidebar-mid':'#2563EB','--sidebar-to':'#60A5FA'},forest:{'--brand-600':'#047857','--brand-500':'#059669','--brand-400':'#10B981','--brand-300':'#6EE7B7','--brand-100':'#D1FAE5','--sidebar-from':'#047857','--sidebar-mid':'#059669','--sidebar-to':'#34D399'},sunset:{'--brand-600':'#C2410C','--brand-500':'#EA580C','--brand-400':'#F97316','--brand-300':'#FDC99A','--brand-100':'#FFEDD5','--sidebar-from':'#C2410C','--sidebar-mid':'#EA580C','--sidebar-to':'#FB923C'},rose:{'--brand-600':'#BE185D','--brand-500':'#DB2777','--brand-400':'#EC4899','--brand-300':'#F9A8D4','--brand-100':'#FCE7F3','--sidebar-from':'#BE185D','--sidebar-mid':'#DB2777','--sidebar-to':'#F472B6'},midnight:{'--brand-600':'#3730A3','--brand-500':'#4F46E5','--brand-400':'#6366F1','--brand-300':'#A5B4FC','--brand-100':'#E0E7FF','--sidebar-from':'#1E1B4B','--sidebar-mid':'#3730A3','--sidebar-to':'#6366F1'}};var v=m[t];if(!v)return;var r=document.documentElement;Object.keys(v).forEach(function(k){r.style.setProperty(k,v[k]);});}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // try/catch: durante o build do Vercel não há DB disponível
  let firstName = 'você';
  let isAdmin = false;
  try {
    const user = await getCurrentUser();
    firstName = (user.name || 'você').split(' ')[0];
    isAdmin =
      user.role === 'admin' ||
      !!(process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL);
  } catch {
    // sem banco no build-time — usa fallback
  }

  return (
    <html lang="pt-BR">
      <head>
        {/* Aplica tema salvo antes do primeiro render — sem flash */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body
        className={`${font.className} antialiased overflow-hidden`}
        style={{ background: 'var(--app-bg)', color: 'var(--text-strong)', height: '100dvh' }}
      >

        <RightDock />

        {/* ── Desktop: viewport fixo, sem scroll no browser ────────── */}
        <div className="hidden md:flex h-full justify-center px-6 py-6">
          <div className="flex gap-6 w-full h-full" style={{ maxWidth: 1400 }}>

            {/* Sidebar: altura total, não rola */}
            <div className="flex-shrink-0 h-full">
              <Sidebar userName={firstName} isAdmin={isAdmin} />
            </div>

            {/* Área de conteúdo: coluna flex, preenche o restante. pr extra reserva espaço pra RightDock não sobrepor. */}
            <main className="flex-1 min-w-0 h-full flex flex-col overflow-hidden pr-16">
              {/* Conteúdo rola internamente (sem scrollbar visível) */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-1 pb-2">
                {children}
              </div>
              {/* Footer sempre visível na parte de baixo */}
              <Footer />
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
            <Footer />
          </main>
        </div>

      </body>
    </html>
  );
}

function Footer() {
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
            Desenvolvido por <span style={{ color: 'var(--brand-500)' }}>Nolei Creative</span>
          </span>
        </div>
        <p className="text-[9px]" style={{ color: 'var(--text-soft)', opacity: 0.5 }}>
          © {new Date().getFullYear()} Nolei Creative
        </p>
      </div>

      {/* Desktop: distribuído */}
      <div className="hidden md:flex items-center justify-between">
        <p className="text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>
          © {new Date().getFullYear()} Nolei Creative · Todos os direitos reservados
        </p>
        <div className="flex items-center gap-2">
          <a href="/termos" className="text-[10px] font-bold hover:underline" style={{ color: 'var(--text-soft)' }}>
            Termos de uso
          </a>
          <span style={{ color: 'var(--text-soft)', opacity: 0.4 }}>·</span>
          <span className="text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>
            Desenvolvido por <span style={{ color: 'var(--brand-500)' }}>Nolei Creative</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
