'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Play, X } from 'lucide-react';

interface HeroActionsProps {
  hasSession: boolean;
  ctaUrl: string;
}

export default function HeroActions({ hasSession, ctaUrl }: HeroActionsProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure portal only mounts on the client-side
  useEffect(() => {
    setMounted(true);
    const handleOpen = () => setIsVideoOpen(true);
    window.addEventListener('open-vitalis-video', handleOpen);
    return () => window.removeEventListener('open-vitalis-video', handleOpen);
  }, []);

  const modalOverlay = isVideoOpen && (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={() => setIsVideoOpen(false)}
    >
      {/* Modal Card */}
      <div 
        className="w-full max-w-4xl aspect-video rounded-3xl overflow-hidden border border-white/20 bg-black shadow-2xl relative"
        onClick={(e) => e.stopPropagation()} // Prevent close on clicking the video itself
      >
        {/* Close Button */}
        <button
          onClick={() => setIsVideoOpen(false)}
          className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
          aria-label="Fechar vídeo"
        >
          <X size={18} />
        </button>

        {/* Video Player */}
        <video 
          src="/images/video-hero-vitalis.mp4" 
          controls 
          autoPlay 
          className="w-full h-full object-contain"
        />
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out both;
        }
      `}</style>
    </div>
  );

  return (
    <>
      {/* CTAs */}
      <div className="flex flex-row items-center justify-center md:justify-start gap-2 w-full md:w-auto">
        <Link
          href={ctaUrl}
          className="flex-1 md:flex-none px-4 md:px-8 py-3 md:py-4 rounded-full bg-[#14150F] text-[#F4F5F1] hover:bg-[#8A9A5B] active:scale-95 text-[10px] md:text-xs font-extrabold uppercase tracking-wider md:tracking-widest text-center transition-all duration-300 shadow-lg shadow-black/10"
        >
          {hasSession ? 'Painel' : 'Começar'}
        </Link>
        
        {!hasSession && (
          <Link
            href="/register"
            className="flex-1 md:flex-none px-4 md:px-8 py-3 md:py-4 rounded-full bg-white/60 text-[#14150F] border border-white/80 hover:bg-white/90 active:scale-95 text-[10px] md:text-xs font-extrabold uppercase tracking-wider md:tracking-widest text-center transition-all duration-300 shadow-sm"
          >
            Cadastrar
          </Link>
        )}

        {/* Subtle Play Video Button */}
        <button
          onClick={() => setIsVideoOpen(true)}
          aria-label="Assistir vídeo de apresentação"
          className="hidden md:flex w-12 h-12 rounded-full bg-white/45 border border-white/60 hover:bg-white/80 active:scale-95 text-[#14150F] hover:text-[#8A9A5B] shadow-md items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer flex-shrink-0"
        >
          <Play size={16} className="fill-current ml-0.5" />
        </button>
      </div>

      {/* Render the modal in document.body using a React Portal */}
      {mounted && isVideoOpen ? createPortal(modalOverlay, document.body) : null}
    </>
  );
}
