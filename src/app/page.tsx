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
        <div className="relative pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 min-h-[85vh] z-10">
          {/* Background glow decoration */}
          <div className="absolute left-[20%] top-[30%] w-96 h-96 bg-[#8A9A5B]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Text Area */}
          <div className="flex-1 text-center md:text-left z-10">
            {/* Subtle Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B7C48E]/40 border border-[#8A9A5B]/30 text-xs font-bold text-[#14150F] uppercase tracking-widest mb-6">
              <Sparkles size={12} className="text-[#8A9A5B] animate-pulse" />
              VITALIS APRESENTA
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#14150F] uppercase leading-none mb-6">
              SEU SISTEMA PESSOAL DE <span className="text-[#8A9A5B]">BEM-ESTAR</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-[#6B6F63] font-semibold mb-6 max-w-lg leading-relaxed">
              Organize sua nutrição, monitore sua hidratação diária, controle suas finanças e mantenha suas tarefas e agenda alinhadas em um único painel minimalista e sofisticado.
            </p>

            {/* Target Audience / Use Cases */}
            <div className="flex flex-wrap gap-2.5 mb-8 justify-center md:justify-start">
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
          <div className="flex-1 w-full max-w-md h-[400px] flex items-center justify-center relative z-10">
            <HeroWrapper />
          </div>
        </div>
      </section>

      {/* 3. Resumo em 1 frase + selo */}
      <section className="py-16 px-6 md:px-12 bg-[#EAECE5] text-[#14150F] border-y border-[#D0D4C5]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-white/40 border border-white/60 p-2 shadow-md flex-shrink-0">
              <img src="/images/vitalis-logo.png" alt="Vitalis Logo" className="w-full h-full object-contain" />
            </div>
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
