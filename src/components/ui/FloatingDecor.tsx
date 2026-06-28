import React from 'react';

/**
 * Folhas/orbes decorativos flutuantes com blur e deriva lenta.
 * Puramente decorativo (aria-hidden) e respeita prefers-reduced-motion via CSS (.float-decor).
 */
const Leaf: React.FC<{ className?: string; color?: string; size?: number }> = ({ className, color = '#95D5B2', size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
    <path d="M4 28C4 28 12 26 22 14C26 8 26 4 26 4C26 4 22 4 16 10C6 20 4 28 4 28Z" fill={color} />
  </svg>
);

interface FloatingDecorProps {
  variant?: 'light' | 'dark';
}

const FloatingDecor: React.FC<FloatingDecorProps> = ({ variant = 'light' }) => {
  const a = variant === 'dark' ? '#74C69D' : '#95D5B2';
  const b = variant === 'dark' ? '#40916C' : '#74C69D';
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <Leaf className="float-decor" color={a} size={90} />
      <span className="float-decor slow" style={{ top: '12%', right: '6%' }}>
        <span className="block w-24 h-24 rounded-full blob-shape" style={{ background: b, opacity: 0.4 }} />
      </span>
      <Leaf className="float-decor delay" color={b} size={64} />
      <style>{`
        .float-decor:nth-of-type(1){ top: -10px; left: -10px; }
        .float-decor:nth-of-type(3){ bottom: 8%; left: 4%; transform: rotate(180deg); }
      `}</style>
    </div>
  );
};

export default FloatingDecor;
