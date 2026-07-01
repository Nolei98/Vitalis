import React from 'react';
import Link from 'next/link';

export default function MarketingFooter() {
  return (
    <footer className="w-full bg-[#EAECE5] border-t border-[#D0D4C5] py-12 px-6 md:px-12 text-[#6B6F63]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-wider text-[#14150F] uppercase">VITALIS</span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-[#B7C48E] text-[#14150F] px-2 py-0.5 rounded-full">
              Sustentável
            </span>
          </div>
          <p className="text-xs font-semibold">Seu sistema pessoal de bem-estar e equilíbrio.</p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
          <Link href="/termos" className="hover:text-[#14150F] transition-colors">Termos</Link>
          <a href="#sobre" className="hover:text-[#14150F] transition-colors">Sobre</a>
          <a href="https://portfolio-jr-lilac.vercel.app/?lang=pt" target="_blank" rel="noopener noreferrer" className="hover:text-[#14150F] transition-colors">
            Contato
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right text-[11px] font-semibold flex flex-col gap-1">
          <p>© {new Date().getFullYear()} Vitalis. Todos os direitos reservados.</p>
          <p>
            Desenvolvido por{' '}
            <a href="https://portfolio-jr-lilac.vercel.app/?lang=pt" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#8A9A5B] hover:text-[#14150F]">
              João Rodrigues
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
