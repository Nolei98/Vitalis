import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const font = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://vitalis.vercel.app"),
  title: {
    default: "Vitalis — Sistema Pessoal de Bem-Estar e Produtividade",
    template: "%s · Vitalis",
  },
  description: "Vitalis é um sistema integrado de bem-estar. Monitore sua nutrição, ingestão de água, finanças pessoais, agenda unificada e tarefas diárias em um único painel sofisticado.",
  keywords: [
    "vitalis", 
    "bem-estar", 
    "saúde", 
    "nutrição", 
    "finanças pessoais", 
    "produtividade", 
    "gestão de tempo", 
    "organização pessoal", 
    "dieta", 
    "hábitos saudáveis"
  ],
  authors: [{ name: "eu", url: "https://portfolio-jr-lilac.vercel.app/?lang=pt" }],
  creator: "eu",
  applicationName: "Vitalis",
  generator: "Next.js",
  category: "lifestyle",
  openGraph: {
    title: "Vitalis — Sistema Pessoal de Bem-Estar e Produtividade",
    description: "Gerencie nutrição, hidratação, finanças, agenda, tarefas e metas em um único painel com estética glassmorphism.",
    url: "https://vitalis.vercel.app",
    siteName: "Vitalis",
    images: [
      {
        url: "https://vitalis.vercel.app/images/vitalis-logo.png",
        width: 512,
        height: 512,
        alt: "Vitalis Logo",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Vitalis — Sistema Pessoal de Bem-Estar e Produtividade",
    description: "Gerencie nutrição, hidratação, finanças, agenda, tarefas e metas em um único painel.",
    images: ["https://vitalis.vercel.app/images/vitalis-logo.png"],
  },
  icons: {
    icon: "/images/vitalis-logo.png",
    shortcut: "/images/vitalis-logo.png",
    apple: "/images/vitalis-logo.png",
  },
};

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('lifeos_theme');if(!t)return;var m={vitalis:{'--brand-600':'#76844e','--brand-500':'#8A9A5B','--brand-400':'#9fb06d','--brand-300':'#B7C48E','--brand-100':'#EAECE5','--app-bg':'#F4F5F1','--sidebar-from':'#5D6A3C','--sidebar-mid':'#8A9A5B','--sidebar-to':'#B7C48E'},violet:{'--brand-600':'#6D49E8','--brand-500':'#7C5CFC','--brand-400':'#9871F5','--brand-300':'#B7A6FF','--brand-100':'#EDE8FF','--sidebar-from':'#6D49E8','--sidebar-mid':'#9871F5','--sidebar-to':'#B794FF'},ocean:{'--brand-600':'#1D4ED8','--brand-500':'#2563EB','--brand-400':'#3B82F6','--brand-300':'#93C5FD','--brand-100':'#DBEAFE','--sidebar-from':'#1D4ED8','--sidebar-mid':'#2563EB','--sidebar-to':'#60A5FA'},sunset:{'--brand-600':'#C2410C','--brand-500':'#EA580C','--brand-400':'#F97316','--brand-300':'#FDC99A','--brand-100':'#FFEDD5','--sidebar-from':'#C2410C','--sidebar-mid':'#EA580C','--sidebar-to':'#FB923C'},rose:{'--brand-600':'#BE185D','--brand-500':'#DB2777','--brand-400':'#EC4899','--brand-300':'#F9A8D4','--brand-100':'#FCE7F3','--sidebar-from':'#BE185D','--sidebar-mid':'#DB2777','--sidebar-to':'#F472B6'},midnight:{'--brand-600':'#3730A3','--brand-500':'#4F46E5','--brand-400':'#6366F1','--brand-300':'#A5B4FC','--brand-100':'#E0E7FF','--sidebar-from':'#1E1B4B','--sidebar-mid':'#3730A3','--sidebar-to':'#6366F1'}};var v=m[t];if(!v)return;var r=document.documentElement;Object.keys(v).forEach(function(k){r.style.setProperty(k,v[k]);});}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${font.className} antialiased`} style={{ background: 'var(--app-bg)', color: 'var(--text-strong)' }}>
        {children}
      </body>
    </html>
  );
}
