export interface Theme {
  id: string;
  label: string;
  emoji: string;
  preview: string; // primary color for preview swatch
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  {
    id: 'vitalis',
    label: 'Vitalis',
    emoji: '🌿',
    preview: '#8A9A5B',
    vars: {
      '--brand-600': '#76844e',
      '--brand-500': '#8A9A5B',
      '--brand-400': '#9fb06d',
      '--brand-300': '#B7C48E',
      '--brand-100': '#EAECE5',
      '--app-bg':    '#F4F5F1',
      '--sidebar-from': '#5D6A3C',
      '--sidebar-mid':  '#8A9A5B',
      '--sidebar-to':   '#B7C48E',
    },
  },
  {
    id: 'violet',
    label: 'Violeta',
    emoji: '💜',
    preview: '#7C5CFC',
    vars: {
      '--brand-600': '#6D49E8',
      '--brand-500': '#7C5CFC',
      '--brand-400': '#9871F5',
      '--brand-300': '#B7A6FF',
      '--brand-100': '#EDE8FF',
      '--app-bg':    '#F4F2FE',
      '--sidebar-from': '#6D49E8',
      '--sidebar-mid':  '#9871F5',
      '--sidebar-to':   '#B794FF',
    },
  },
  {
    id: 'ocean',
    label: 'Oceano',
    emoji: '🌊',
    preview: '#2563EB',
    vars: {
      '--brand-600': '#1D4ED8',
      '--brand-500': '#2563EB',
      '--brand-400': '#3B82F6',
      '--brand-300': '#93C5FD',
      '--brand-100': '#DBEAFE',
      '--app-bg':    '#EFF6FF',
      '--sidebar-from': '#1D4ED8',
      '--sidebar-mid':  '#2563EB',
      '--sidebar-to':   '#60A5FA',
    },
  },
  {
    id: 'sunset',
    label: 'Pôr do Sol',
    emoji: '🌅',
    preview: '#EA580C',
    vars: {
      '--brand-600': '#C2410C',
      '--brand-500': '#EA580C',
      '--brand-400': '#F97316',
      '--brand-300': '#FDC99A',
      '--brand-100': '#FFEDD5',
      '--app-bg':    '#FFF7ED',
      '--sidebar-from': '#C2410C',
      '--sidebar-mid':  '#EA580C',
      '--sidebar-to':   '#FB923C',
    },
  },
  {
    id: 'rose',
    label: 'Rosa',
    emoji: '🌸',
    preview: '#DB2777',
    vars: {
      '--brand-600': '#BE185D',
      '--brand-500': '#DB2777',
      '--brand-400': '#EC4899',
      '--brand-300': '#F9A8D4',
      '--brand-100': '#FCE7F3',
      '--app-bg':    '#FDF2F8',
      '--sidebar-from': '#BE185D',
      '--sidebar-mid':  '#DB2777',
      '--sidebar-to':   '#F472B6',
    },
  },
  {
    id: 'midnight',
    label: 'Meia-Noite',
    emoji: '🌙',
    preview: '#4F46E5',
    vars: {
      '--brand-600': '#3730A3',
      '--brand-500': '#4F46E5',
      '--brand-400': '#6366F1',
      '--brand-300': '#A5B4FC',
      '--brand-100': '#E0E7FF',
      '--app-bg':    '#EEF2FF',
      '--sidebar-from': '#1E1B4B',
      '--sidebar-mid':  '#3730A3',
      '--sidebar-to':   '#6366F1',
    },
  },
];
