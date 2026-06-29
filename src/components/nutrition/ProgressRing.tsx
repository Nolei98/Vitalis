'use client';

import React, { useEffect, useState, useId } from 'react';

interface ProgressRingProps {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}

/** Anel de progresso animado no tema Claymorphism (roxo). */
export default function ProgressRing({ value, size = 150, stroke = 14, children }: ProgressRingProps) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value || 0));
  const offset = circumference - (animated / 100) * circumference;
  const id = useId();

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(clamped));
    return () => cancelAnimationFrame(t);
  }, [clamped]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={`ring-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9871F5" />
            <stop offset="100%" stopColor="#c0a8ff" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} stroke="rgba(152,113,245,0.15)" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={`url(#ring-${id})`}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
