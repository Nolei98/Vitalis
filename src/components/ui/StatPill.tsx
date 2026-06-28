import React from 'react';

interface StatPillProps {
  value: string;
  label: string;
  color?: string;
  className?: string;
}

/** Pílula de métrica (kcal, g de proteína, ml de água...). */
const StatPill: React.FC<StatPillProps> = ({ value, label, color = '#2D6A4F', className = '' }) => (
  <div
    className={`inline-flex flex-col items-center px-5 py-2.5 rounded-pill bg-white shadow-soft ${className}`}
    style={{ borderRadius: 999 }}
  >
    <span className="text-sm font-extrabold leading-none" style={{ color }}>{value}</span>
    <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-ink-soft mt-1">{label}</span>
  </div>
);

export default StatPill;
