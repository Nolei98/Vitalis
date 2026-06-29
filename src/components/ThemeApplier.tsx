'use client';

import { useEffect } from 'react';
import { THEMES } from '@/lib/themes';

export default function ThemeApplier() {
  useEffect(() => {
    const saved = localStorage.getItem('lifeos_theme');
    if (!saved) return;
    const theme = THEMES.find((t) => t.id === saved);
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, []);

  return null;
}
