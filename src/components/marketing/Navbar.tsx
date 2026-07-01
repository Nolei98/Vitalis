'use client';

import React from 'react';
import Link from 'next/link';

interface NavbarProps {
  hasSession: boolean;
}

export default function Navbar({ hasSession }: NavbarProps) {
  const ctaUrl = hasSession ? '/dashboard' : '/login';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-white/50 bg-white/35 backdrop-blur-xl shadow-lg shadow-black/5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <img src="/images/vitalis-logo.png" alt="Vitalis" className="h-6 sm:h-8 w-auto object-contain transition-all duration-300 group-hover:scale-105" />
        </Link>

        {/* Links */}
        <div className="flex items-center gap-2.5 sm:gap-6 md:gap-8 text-[8px] sm:text-xs font-bold uppercase tracking-widest text-[#6B6F63]">
          <a href="#sobre" className="hover:text-[#14150F] transition-all">Sobre</a>
          <a href="#como-funciona" className="hover:text-[#14150F] transition-all">Funcionamento</a>
          <a href="#recursos" className="hover:text-[#14150F] transition-all">Recursos</a>
          <a href="#mockups" className="hover:text-[#14150F] transition-all">Visual</a>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          <Link
            href={ctaUrl}
            className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#8A9A5B] to-[#76844e] text-[#F4F5F1] hover:scale-105 active:scale-95 text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md shadow-[#8A9A5B]/20 border border-white/25 cursor-pointer"
          >
            {hasSession ? 'Painel →' : 'Entrar →'}
          </Link>
        </div>
      </div>
    </nav>
  );
}
