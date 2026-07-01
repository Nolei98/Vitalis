'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('./Hero3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] flex items-center justify-center relative">
      <div className="w-64 h-64 rounded-full border border-[#8A9A5B]/20 bg-[#8A9A5B]/5 animate-pulse" />
    </div>
  ),
});

export default function HeroWrapper() {
  return (
    <div className="w-full h-full">
      <Hero3D />
    </div>
  );
}
