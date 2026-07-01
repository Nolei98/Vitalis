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

      {/* Subtle botanical watermarks */}
      <LeafBranch className="absolute top-[10%] right-[-8%] w-80 h-80 text-[#8A9A5B] opacity-[0.05] pointer-events-none select-none z-0 rotate-[120deg]" />
      <LeafMonstera className="absolute bottom-[-10%] left-[-5%] w-72 h-72 text-[#8A9A5B] opacity-[0.04] pointer-events-none select-none z-0 rotate-[45deg]" />

    </section>
  );
}

// Decorative leaf helpers
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
