import {
  LayoutDashboard, CalendarDays, CheckSquare, Salad, Droplets,
  Wallet, Target, AlarmClock, BarChart2, MessageCircle, ShieldCheck,
  Bell, Settings, Plug, Users, Home, type LucideIcon,
} from 'lucide-react';

export type ModKey =
  | 'dash' | 'agenda' | 'tarefas' | 'dieta' | 'agua'
  | 'financas' | 'metas' | 'alarmes' | 'relatorios'
  | 'social' | 'usuarios' | 'notif' | 'config' | 'conexoes';

interface ModConfig {
  Icon: LucideIcon;
  gradient: string;
  accent: string;
}

export const MOD: Record<ModKey, ModConfig> = {
  dash:       { Icon: LayoutDashboard, gradient: 'linear-gradient(135deg,#6D49E8,#9871F5)', accent: '#7C5CFC' },
  agenda:     { Icon: CalendarDays,    gradient: 'linear-gradient(135deg,#3A6BCF,#5B8DEF)', accent: '#5B8DEF' },
  tarefas:    { Icon: CheckSquare,     gradient: 'linear-gradient(135deg,#1A9E6E,#2BC48A)', accent: '#2BC48A' },
  dieta:      { Icon: Salad,           gradient: 'linear-gradient(135deg,#D96030,#FF8A5B)', accent: '#FF8A5B' },
  agua:       { Icon: Droplets,        gradient: 'linear-gradient(135deg,#1AA3CC,#36C5F0)', accent: '#36C5F0' },
  financas:   { Icon: Wallet,          gradient: 'linear-gradient(135deg,#6A3DD6,#8B5CF6)', accent: '#8B5CF6' },
  metas:      { Icon: Target,          gradient: 'linear-gradient(135deg,#D94C91,#FF6FB5)', accent: '#FF6FB5' },
  alarmes:    { Icon: AlarmClock,      gradient: 'linear-gradient(135deg,#CC8800,#FFB020)', accent: '#FFB020' },
  relatorios: { Icon: BarChart2,       gradient: 'linear-gradient(135deg,#0D9488,#14B8A6)', accent: '#14B8A6' },
  social:     { Icon: MessageCircle,   gradient: 'linear-gradient(135deg,#B020C8,#D946EF)', accent: '#D946EF' },
  usuarios:   { Icon: ShieldCheck,     gradient: 'linear-gradient(135deg,#7C5CFC,#A78BFA)', accent: '#A78BFA' },
  notif:      { Icon: Bell,            gradient: 'linear-gradient(135deg,#D94060,#FB7185)', accent: '#FB7185' },
  config:     { Icon: Settings,        gradient: 'linear-gradient(135deg,#64748B,#94A3B8)', accent: '#94A3B8' },
  conexoes:   { Icon: Plug,            gradient: 'linear-gradient(135deg,#475569,#64748B)', accent: '#64748B' },
};

interface ModIconProps {
  mod: ModKey;
  /** 'sm' = 28px  'md' = 40px  'lg' = 52px */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE = {
  sm: { wrap: 28, icon: 14, radius: 10 },
  md: { wrap: 40, icon: 18, radius: 14 },
  lg: { wrap: 52, icon: 24, radius: 18 },
};

export default function ModIcon({ mod, size = 'md', className = '' }: ModIconProps) {
  const { Icon, gradient } = MOD[mod];
  const s = SIZE[size];
  return (
    <span
      className={`flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: s.wrap,
        height: s.wrap,
        borderRadius: s.radius,
        background: gradient,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <Icon size={s.icon} strokeWidth={2.2} color="white" />
    </span>
  );
}
