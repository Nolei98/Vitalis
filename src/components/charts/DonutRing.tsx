'use client';

interface Props {
  percent: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export default function DonutRing({
  percent,
  color,
  size = 160,
  strokeWidth = 14,
  label,
  sublabel,
}: Props) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * Math.min(percent, 100)) / 100;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(.16,1,.3,1)',
            filter: `drop-shadow(0 0 6px ${color}88)`,
          }}
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label && <span className="font-black text-[var(--text-strong)]" style={{ fontSize: size * 0.14 }}>{label}</span>}
          {sublabel && <span className="font-bold text-[var(--text-soft)]" style={{ fontSize: size * 0.08 }}>{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
