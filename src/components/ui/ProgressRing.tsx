import React, { useEffect, useState } from 'react';

interface ProgressRingProps {
  value: number; // 0..100 (será limitado)
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  gradient?: boolean;
  children?: React.ReactNode;
}

/** Anel de progresso animado (verde→lima). Usado em calorias, hidratação e macros. */
const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 180,
  stroke = 14,
  color = '#40916C',
  trackColor,
  gradient = true,
  children,
}) => {
  const [animated, setAnimated] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (animated / 100) * circumference;
  const id = React.useId();

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(clamped));
    return () => cancelAnimationFrame(t);
  }, [clamped]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={`ring-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2D6A4F" />
            <stop offset="100%" stopColor="#74C69D" />
          </linearGradient>
        </defs>
        <circle
          className="ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={trackColor || undefined}
        />
        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={gradient ? `url(#ring-${id})` : color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
};

export default ProgressRing;
