import React from 'react';

type Variant = 'primary' | 'gradient' | 'accent' | 'outline' | 'soft';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-green-700 text-white shadow-soft hover:bg-green-900',
  gradient: 'bg-signature text-white shadow-soft',
  accent: 'bg-accent-500 text-white shadow-glow hover:bg-accent-400',
  outline: 'bg-transparent text-green-700 border-2 border-green-500/30 hover:border-green-500',
  soft: 'bg-green-500/10 text-green-700 hover:bg-green-500/20',
};

/** CTA em pílula (variações verde/gradiente/acento/outline). */
const PillButton: React.FC<PillButtonProps> = ({ variant = 'primary', fullWidth, className = '', children, ...rest }) => (
  <button
    {...rest}
    className={`btn-pill press inline-flex items-center justify-center gap-2 px-7 py-4 font-bold text-[12px] uppercase tracking-[0.12em] disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
  >
    {children}
  </button>
);

export default PillButton;
