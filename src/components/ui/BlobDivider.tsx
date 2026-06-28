import React from 'react';

interface BlobDividerProps {
  color?: string; // cor da onda (geralmente a cor da seção de cima)
  flip?: boolean;
  className?: string;
}

/** Divisor de seção em onda orgânica (substitui linhas retas). */
const BlobDivider: React.FC<BlobDividerProps> = ({ color = '#FFFFFF', flip = false, className = '' }) => (
  <svg
    className={`blob-divider ${className}`}
    viewBox="0 0 1440 48"
    preserveAspectRatio="none"
    style={{ transform: flip ? 'rotate(180deg)' : undefined }}
    aria-hidden="true"
  >
    <path
      d="M0,24 C240,64 480,0 720,20 C960,40 1200,8 1440,28 L1440,48 L0,48 Z"
      fill={color}
    />
  </svg>
);

export default BlobDivider;
