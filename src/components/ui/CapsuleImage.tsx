import React from 'react';

interface CapsuleImageProps {
  emoji: string;
  size?: number;
  shape?: 'circle' | 'capsule';
  className?: string;
}

/**
 * Avatar de alimento em máscara circular/cápsula usando emoji (app é offline, sem fotos).
 * Mantém o conceito visual de imagem circular com halo das referências.
 */
const CapsuleImage: React.FC<CapsuleImageProps> = ({ emoji, size = 56, shape = 'circle', className = '' }) => (
  <div
    className={`capsule flex items-center justify-center flex-shrink-0 ${className}`}
    style={{
      width: shape === 'capsule' ? size * 1.4 : size,
      height: size,
      borderRadius: shape === 'circle' ? '999px' : 'var(--r-image)',
      fontSize: size * 0.5,
    }}
    aria-hidden="true"
  >
    <span>{emoji}</span>
  </div>
);

export default CapsuleImage;
