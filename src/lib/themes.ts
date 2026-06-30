export interface Theme {
  id: string;
  label: string;
  emoji: string;
  preview: string; // primary color for preview swatch
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
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
    id: 'forest',
    label: 'Floresta',
    emoji: '🌿',
    preview: '#059669',
    vars: {
      '--brand-600': '#047857',
      '--brand-500': '#059669',
      '--brand-400': '#10B981',
      '--brand-300': '#6EE7B7',
      '--brand-100': '#D1FAE5',
      '--app-bg':    '#F0FDF4',
      '--sidebar-from': '#047857',
      '--sidebar-mid':  '#059669',
      '--sidebar-to':   '#34D399',
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
