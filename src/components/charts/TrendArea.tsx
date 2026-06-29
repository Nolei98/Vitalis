'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface TrendPoint {
  label: string;
  value: number;
  target?: number;
}

interface Props {
  data: TrendPoint[];
  color?: string;
  secondColor?: string;
  height?: number;
  showGrid?: boolean;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="vt-tooltip">
      <p className="text-[var(--text-soft)] text-[11px] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-black text-[var(--text-strong)]">
          {p.name === 'target' ? 'Meta: ' : ''}{p.value}
        </p>
      ))}
    </div>
  );
}

export default function TrendArea({ data, color = '#7C5CFC', secondColor, height = 140, showGrid = false }: Props) {
  const id = `ta-${color.replace('#', '')}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -28 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          {secondColor && (
            <linearGradient id={`${id}-2`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={secondColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={secondColor} stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />}
        <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700, fill: '#9B97AA' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#9B97AA' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${id})`}
          dot={false}
          animationDuration={900}
        />
        {secondColor && (
          <Area
            type="monotone"
            dataKey="target"
            stroke={secondColor}
            strokeWidth={1.5}
            strokeDasharray="5 3"
            fill={`url(#${id}-2)`}
            dot={false}
            animationDuration={900}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
