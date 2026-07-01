import Link from 'next/link';
import { getSessionUserId } from '@/lib/session';
import Navbar from '@/components/marketing/Navbar';
import ProcessCards from '@/components/marketing/ProcessCards';
import FeatureGrid from '@/components/marketing/FeatureGrid';
import ProductMockups from '@/components/marketing/ProductMockups';
import CTASection from '@/components/marketing/CTASection';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import HeroWrapper from '@/components/marketing/HeroWrapper';
import ScrollToTop from '@/components/marketing/ScrollToTop';
import HeroActions from '@/components/marketing/HeroActions';
import { User, Users, Briefcase, Handshake, Sparkles } from 'lucide-react';
import MobilePlayButton from '@/components/marketing/MobilePlayButton';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const sessionId = await getSessionUserId();
  const hasSession = !!sessionId;
  const ctaUrl = hasSession ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen bg-[#F4F5F1] text-[#14150F] selection:bg-[#8A9A5B] selection:text-white font-sans overflow-x-hidden">
      
      {/* 1. Navbar */}
      <Navbar hasSession={hasSession} />

      {/* 2. Hero Section */}
      <section id="sobre" className="relative w-full overflow-hidden bg-[#F4F5F1] border-b border-[#D0D4C5]">
        {/* Background Image Layer with 80% Opacity (Vivid & Sharp) */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.80] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/backgroud-hero-vitalis.png')" }}
        />
        {/* Responsive Gradient Mask: solid over text, transparent over image/people */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b md:bg-gradient-to-r from-[#F4F5F1] via-[#F4F5F1]/60 md:via-[#F4F5F1]/30 to-transparent" />
        {/* Bottom blend to transition into the next section */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#F4F5F1] via-transparent to-transparent" />
        
        {/* Max-w-6xl Inner Content Area */}
        <div className="relative pt-16 md:pt-32 pb-4 md:pb-20 px-4 md:px-12 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-12 min-h-[80vh] md:min-h-[85vh] z-10">
          {/* Background glow decoration */}
          <div className="absolute left-[20%] top-[30%] w-96 h-96 bg-[#8A9A5B]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Text Area */}
          <div className="flex-1 text-center md:text-left z-10 order-2 md:order-1">
            {/* Subtle Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B7C48E]/40 border border-[#8A9A5B]/30 text-xs font-bold text-[#14150F] uppercase tracking-widest mb-3 md:mb-6">
              <Sparkles size={12} className="text-[#8A9A5B] animate-pulse" />
              VITALIS APRESENTA
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-[#14150F] uppercase leading-none mb-4 md:mb-6">
              SEU SISTEMA PESSOAL DE <span className="text-[#8A9A5B] whitespace-nowrap">BEM-ESTAR</span>
            </h1>

            {/* Subtitle (Hidden on mobile to save space) */}
            <p className="hidden md:block text-sm md:text-base text-[#6B6F63] font-semibold mb-6 max-w-lg leading-relaxed">
              Organize sua nutrição, monitore sua hidratação diária, controle suas finanças e mantenha suas tarefas e agenda alinhadas em um único painel minimalista e sofisticado.
            </p>

            {/* Target Audience / Use Cases (Hidden on mobile to save space) */}
            <div className="hidden md:flex flex-wrap gap-2.5 mb-8 justify-center md:justify-start">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-[#8A9A5B]/10 border border-[#8A9A5B]/25 text-[#14150F] px-3.5 py-1.5 rounded-full shadow-sm">
                <User size={12} className="text-[#8A9A5B]" />
                Uso Pessoal
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-[#8A9A5B]/10 border border-[#8A9A5B]/25 text-[#14150F] px-3.5 py-1.5 rounded-full shadow-sm">
                <Users size={12} className="text-[#8A9A5B]" />
                Círculo de Amizades
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-[#8A9A5B]/10 border border-[#8A9A5B]/25 text-[#14150F] px-3.5 py-1.5 rounded-full shadow-sm">
                <Briefcase size={12} className="text-[#8A9A5B]" />
                Empresarial
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-[#8A9A5B]/10 border border-[#8A9A5B]/25 text-[#14150F] px-3.5 py-1.5 rounded-full shadow-sm">
                <Handshake size={12} className="text-[#8A9A5B]" />
                Para Seus Clientes
              </span>
            </div>

            <HeroActions hasSession={hasSession} ctaUrl={ctaUrl} />
          </div>

          {/* 3D Canvas Area */}
          <div className="flex-1 w-full max-w-md h-[130px] sm:h-[220px] md:h-[400px] flex flex-col items-center justify-center relative z-10 order-1 md:order-2">
            <HeroWrapper />
            <MobilePlayButton />
          {/* Subtle botanical watermarks */}
          <LeafMonstera className="absolute top-[10%] left-[-5%] w-72 h-72 text-[#8A9A5B] opacity-[0.025] pointer-events-none select-none z-0 rotate-45 hidden md:block" />
          <LeafBranch className="absolute bottom-[8%] right-[-5%] w-80 h-80 text-[#8A9A5B] opacity-[0.025] pointer-events-none select-none z-0 rotate-[-30deg]" />
        </div>
      </section>

      {/* 3. Resumo em 1 frase + selo */}
      <section className="py-16 px-6 md:px-12 bg-[#EAECE5] text-[#14150F] border-y border-[#D0D4C5] relative overflow-hidden">
        {/* Subtle botanical watermarks */}
        <LeafBranch className="absolute top-[10%] left-[5%] w-60 h-60 text-[#8A9A5B] opacity-[0.015] pointer-events-none select-none z-0 rotate-[120deg]" />

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-4 flex-shrink-0">
            <img src="/images/vitalis-logo.png" alt="Vitalis Logo" className="w-14 h-14 object-contain flex-shrink-0" />
            <div>
              <h3 className="font-extrabold text-base tracking-wide">VITALIS SYSTEM</h3>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#8A9A5B]">Estética Green & Glass</p>
            </div>
          </div>
          <p className="text-sm md:text-lg font-bold text-[#6B6F63] leading-relaxed flex-1 italic text-center md:text-left">
            "Uma interface que respira harmonia, unificando dados de saúde e economia em uma tela limpa e sem ruídos visuais para apoiar a sua consistência diária."
          </p>
        </div>
      </section>

      {/* 4. Como Funciona (3 cards) */}
      <ProcessCards />

      {/* 5. Features / Módulos */}
      <FeatureGrid />

      {/* 6. Mockups do Produto */}
      <ProductMockups />

      {/* 7. CTA Final */}
      <CTASection hasSession={hasSession} />

      {/* 8. Footer */}
      <MarketingFooter />

      {/* Floating Scroll to Top button */}
      <ScrollToTop />

    </div>
  );
}

// Decorative leaf helper components
function LeafMonstera({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="currentColor" className={className}>
      <path d="M100,20 C140,20 170,50 170,90 C170,120 150,150 100,180 C50,150 30,120 30,90 C30,50 60,20 100,20 M100,40 C95,55 85,70 70,80 C85,85 95,95 100,110 C105,95 115,85 130,80 C115,70 105,55 100,40 M60,60 C70,75 80,85 95,90 C80,95 70,105 60,120 C65,105 65,95 60,60 M140,60 C135,95 135,105 140,120 C130,105 120,95 105,90 C120,85 130,75 140,60 Z" />
    </svg>
  );
}

function LeafBranch({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="currentColor" className={className}>
      <path d="M100,180 C100,120 120,60 170,30 C130,50 110,80 100,110 C90,80 70,50 30,30 C80,60 100,120 100,180 Z" />
      <path d="M100,150 C115,135 135,125 155,120 C135,120 118,125 107,135 Z" />
      <path d="M100,150 C85,135 65,125 45,120 C65,120 82,125 93,135 Z" />
      <path d="M100,110 C115,95 135,85 155,80 C135,80 118,85 107,95 Z" />
      <path d="M100,110 C85,95 65,85 45,80 C65,80 82,85 93,95 Z" />
    </svg>
  );
}
