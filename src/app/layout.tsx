import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const font = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "LifeOS",
  description: "Personal Life Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${font.className} bg-[#F9F6FA] text-gray-800 antialiased h-screen flex items-center justify-center p-4 md:p-6 overflow-hidden`}>
        {/* Centered container wrapper */}
        <div className="flex gap-6 w-full max-w-[1400px] h-full max-h-[900px]">
          
          {/* Sidebar */}
          <aside className="clay-panel w-64 flex-shrink-0 flex flex-col items-center py-8 text-white hidden md:flex h-full">
            <div className="w-20 h-20 rounded-full bg-white/20 mb-4 p-1 shadow-inner">
               <div className="w-full h-full rounded-full bg-indigo-300 overflow-hidden flex items-center justify-center text-3xl">
                 👦🏻
               </div>
            </div>
            <h2 className="text-xl font-bold mb-8 text-white">Olá, João! 👋</h2>
            
            <nav className="w-full px-4 space-y-3 flex-1 overflow-y-auto no-scrollbar">
              {/* Active Button with fixed shadow */}
              <a href="/" className="bg-white text-[#9871F5] shadow-[inset_0px_-4px_0px_rgba(0,0,0,0.1),_0px_4px_10px_rgba(0,0,0,0.15)] block px-4 py-3 font-extrabold text-center rounded-2xl transform active:scale-95 transition-all">
                🏠 Dashboard
              </a>
              <a href="/agenda" className="block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                📅 Agenda
              </a>
              <a href="/tarefas" className="block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                ✅ Tarefas
              </a>
              <a href="/dieta" className="block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                🥗 Dieta
              </a>
              <a href="/agua" className="block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                💧 Hidratação
              </a>
              <a href="/financas" className="block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                💰 Finanças
              </a>
              <a href="/metas" className="block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                🎯 Metas
              </a>
              <a href="/alarmes" className="block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                ⏰ Alarmes
              </a>
              <a href="/relatorios" className="block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                📊 Relatórios
              </a>
              <a href="/notificacoes" className="block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                🔔 Notificações
              </a>
              <a href="/configuracoes" className="block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                ⚙️ Ajustes
              </a>
              <a href="/conexoes" className="block px-4 py-3 font-semibold text-purple-100 hover:bg-white/10 rounded-2xl transition-all active:scale-95">
                🔌 Conexões
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 w-full overflow-y-auto h-full rounded-[32px] p-2 pr-6 no-scrollbar relative">
            {children}
          </main>
        
        </div>
      </body>
    </html>
  );
}
