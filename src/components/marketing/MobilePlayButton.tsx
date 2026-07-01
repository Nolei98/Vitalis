'use client';

import React from 'react';
import { Play } from 'lucide-react';

export default function MobilePlayButton() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-vitalis-video'));
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Assistir vídeo de apresentação"
      className="md:hidden flex items-center gap-2 px-5 py-2.5 mt-1.5 rounded-full bg-white/40 border border-white/60 hover:bg-white/65 active:scale-95 text-[#14150F] text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all cursor-pointer z-20"
    >
      <Play size={12} className="fill-current ml-0.5" />
      <span>Assistir Vídeo</span>
    </button>
  );
}
