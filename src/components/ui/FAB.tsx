import React from 'react';

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // para aria-label
  size?: number;
}

/** Botão de ação flutuante circular laranja. */
const FAB: React.FC<FABProps> = ({ label, size = 64, className = '', children, ...rest }) => (
  <button
    {...rest}
    aria-label={label}
    className={`fab rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size }}
  >
    {children ?? (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    )}
  </button>
);

export default FAB;
