'use client';

import React from 'react';
import Link from 'next/link';

interface CTASectionProps {
  hasSession: boolean;
}

export default function CTASection({ hasSession }: CTASectionProps) {
  const ctaUrl = hasSession ? '/dashboard' : '/login';

  return (
    <section className="py-24 px-6 md:px-12 bg-[#F4F5F1] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute left-[10%] top-[-10%] w-[500px] h-[500px] bg-[#8A9A5B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-[5%] bottom-[-10%] w-[400px] h-[400px] bg-[#B7C48E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="m-glass-card p-12 md:p-20 text-center flex flex-col items-center justify-center border border-white/60 bg-white/45 shadow-2xl relative overflow-hidden">
          {/* Subtle noise/grid back representation */}
          <div className="absolute inset-0 bg-[radial-gradient(#8a9a5b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <p className="text-xs font-bold uppercase tracking-widest text-[#8A9A5B] mb-4 relative z-10">
            A hora de agir é agora
          </p>
          <h2 className="text-3xl md:text-6xl font-black tracking-tighter text-[#14150F] uppercase max-w-2xl leading-none mb-6 relative z-10">
            Simplifique sua vida. Melhore sua saúde.
          </h2>
          <p className="text-sm md:text-base text-[#6B6F63] font-semibold max-w-lg mb-8 relative z-10 leading-relaxed">
            Junte-se aos usuários do Vitalis que já estão gerenciando nutrição, hábitos e finanças sem estresse de forma centralizada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
            <Link
              href={ctaUrl}
              className="px-8 py-4 rounded-full bg-[#14150F] text-[#F4F5F1] hover:bg-[#8A9A5B] active:scale-95 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 shadow-xl"
            >
              {hasSession ? 'Ir para o Dashboard' : 'Entrar no Vitalis'}
            </Link>
            {!hasSession && (
              <Link
                href="/register"
                className="px-8 py-4 rounded-full bg-white/60 text-[#14150F] border border-white/80 hover:bg-white/90 active:scale-95 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 shadow-md"
              >
                Criar perfil gratuito
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
