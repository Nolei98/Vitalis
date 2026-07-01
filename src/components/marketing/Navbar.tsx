'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  hasSession: boolean;
}

export default function Navbar({ hasSession }: NavbarProps) {
  const ctaUrl = hasSession ? '/dashboard' : '/login';
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8">
      <div className="max-w-6xl mx-auto rounded-full border border-white/50 bg-white/35 backdrop-blur-xl shadow-lg shadow-black/5 relative">
        
        {/* Navigation bar content */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-2 sm:py-3">
          
          {/* 1. Mobile Left: Hamburger Toggle (hidden on desktop) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/20 border border-black/5 text-[#14150F] hover:bg-white/45 active:scale-95 transition-all cursor-pointer"
              aria-label="Menu"
            >
              {isOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>

          {/* 2. Desktop Left: Logo (hidden on mobile) */}
          <div className="hidden md:flex flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/images/vitalis-logo.png" alt="Vitalis" className="h-8 w-auto object-contain transition-all duration-300 group-hover:scale-105" />
            </Link>
          </div>

          {/* 3. Desktop Center: Links (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-[#6B6F63]">
            <a href="#sobre" className="hover:text-[#14150F] transition-all">Sobre</a>
            <a href="#como-funciona" className="hover:text-[#14150F] transition-all">Funcionamento</a>
            <a href="#recursos" className="hover:text-[#14150F] transition-all">Recursos</a>
            <a href="#mockups" className="hover:text-[#14150F] transition-all">Visual</a>
          </div>

          {/* 4. CTA Button (always visible on the right) */}
          <div className="flex-shrink-0">
            <Link
              href={ctaUrl}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#8A9A5B] to-[#76844e] text-[#F4F5F1] hover:scale-105 active:scale-95 text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md shadow-[#8A9A5B]/20 border border-white/25 cursor-pointer"
            >
              {hasSession ? 'Painel →' : 'Entrar →'}
            </Link>
          </div>

        </div>

        {/* 5. Mobile Dropdown Menu Overlay */}
        {isOpen && (
          <div className="absolute top-[68px] left-2 right-2 z-50 p-6 rounded-3xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-xl flex flex-col gap-3 md:hidden animate-fade-in">
            <a 
              href="#sobre" 
              onClick={() => setIsOpen(false)} 
              className="text-xs font-black uppercase tracking-widest text-[#6B6F63] hover:text-[#14150F] py-2.5 border-b border-black/5"
            >
              Sobre
            </a>
            <a 
              href="#como-funciona" 
              onClick={() => setIsOpen(false)} 
              className="text-xs font-black uppercase tracking-widest text-[#6B6F63] hover:text-[#14150F] py-2.5 border-b border-black/5"
            >
              Funcionamento
            </a>
            <a 
              href="#recursos" 
              onClick={() => setIsOpen(false)} 
              className="text-xs font-black uppercase tracking-widest text-[#6B6F63] hover:text-[#14150F] py-2.5 border-b border-black/5"
            >
              Recursos
            </a>
            <a 
              href="#mockups" 
              onClick={() => setIsOpen(false)} 
              className="text-xs font-black uppercase tracking-widest text-[#6B6F63] hover:text-[#14150F] py-2.5"
            >
              Visual
            </a>
          </div>
        )}

      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </nav>
  );
}
