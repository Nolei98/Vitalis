import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

/** Barra de busca arredondada com ícone e sombra suave. */
const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Buscar...', className = '' }) => (
  <div className={`flex items-center gap-3 bg-white rounded-pill shadow-soft px-6 py-4 ${className}`} style={{ borderRadius: 999 }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B6B62" strokeWidth="2.5" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="flex-1 bg-transparent border-none outline-none font-medium text-ink-strong placeholder:text-ink-soft/60"
      style={{ border: 'none' }}
    />
    {value && (
      <button onClick={() => onChange('')} aria-label="Limpar busca" className="text-ink-soft/50 hover:text-ink-strong text-lg leading-none">
        ✕
      </button>
    )}
  </div>
);

export default SearchBar;
