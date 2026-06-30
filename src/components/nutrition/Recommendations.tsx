'use client';

import React, { useMemo, useState } from 'react';
import { foodEmoji } from '@/lib/nutrition/emoji';
import { reasonFor, recommendedByCategory } from '@/lib/nutrition/recommendations';
import { GOAL_LABELS } from '@/lib/nutrition/calc';
import type { Goal } from '@/lib/nutrition/types';

const GOALS: Goal[] = ['hipertrofia', 'emagrecimento', 'manutencao'];
const SHORT: Record<Goal, string> = { hipertrofia: 'Hipertrofia', emagrecimento: 'Emagrecer', manutencao: 'Manutenção' };

export default function Recommendations({ defaultGoal }: { defaultGoal?: Goal }) {
  const [goal, setGoal] = useState<Goal>(defaultGoal || 'manutencao');
  const grouped = useMemo(() => recommendedByCategory(goal), [goal]);
  const categories = Object.keys(grouped);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm font-bold text-gray-500">Objetivo:</p>
        <div className="flex gap-2 bg-white rounded-full p-1 clay-card">
          {GOALS.map(g => (
            <button key={g} onClick={() => setGoal(g)} className={`px-4 py-2 rounded-full text-xs font-bold transition ${goal === g ? 'bg-[#9871F5] text-white' : 'text-gray-500'}`}>{SHORT[g]}</button>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-400">Alimentos indicados para <b>{GOAL_LABELS[goal]}</b> · valores por 100g</p>

      {categories.map(cat => (
        <div key={cat} className="space-y-3">
          <h3 className="text-xs font-extrabold text-[#4a3f72] uppercase tracking-wider">{cat}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped[cat].map(f => (
              <div key={f.id} className="clay-card p-4 bg-white">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{foodEmoji(f.name, f.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-[#4a3f72] truncate">{f.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{f.energyKcal} kcal · {f.proteinG}g P</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 italic mt-2 border-t border-gray-100 pt-2">{reasonFor(f, goal)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
