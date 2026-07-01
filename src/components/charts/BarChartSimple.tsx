'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export interface BarPoint {
  label: string;
  value: number;
  value2?: number;
}

interface Props {
  data: BarPoint[];
  color?: string;
  color2?: string;
  height?: number;
  /** Prefixo exibido antes do valor no tooltip (ex.: "R$"). Não usar função aqui —
   * este componente é 'use client' e recebe props de Server Components, que não
   * podem passar funções pela fronteira server/client. */
  unit?: string;
}

function TooltipContent({ active, payload, label, unit }: { active?: boolean; payload?: { value: number }[]; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="vt-tooltip">
      <p className="text-[var(--text-soft)] text-[11px] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-black">{unit ? `${unit}${p.value}` : p.value}</p>
      ))}
    </div>
  );
}

export default function BarChartSimple({ data, color = '#8B5CF6', color2, height = 140, unit }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -28 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700, fill: '#9B97AA' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#9B97AA' }} axisLine={false} tickLine={false} />
        <Tooltip content={<TooltipContent unit={unit} />} cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 8 }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill={color} animationDuration={800} maxBarSize={40}>
          {data.map((_, i) => <Cell key={i} fill={color} fillOpacity={0.9} />)}
        </Bar>
        {color2 && (
          <Bar dataKey="value2" radius={[6, 6, 0, 0]} fill={color2} animationDuration={900} maxBarSize={40}>
            {data.map((_, i) => <Cell key={i} fill={color2} fillOpacity={0.9} />)}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
