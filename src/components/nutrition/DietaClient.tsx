'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgressRing from './ProgressRing';
import MealBuilder from './MealBuilder';
import FoodLibrary from './FoodLibrary';
import Recommendations from './Recommendations';
import ProfileForm from './ProfileForm';
import { deleteMeal } from '@/app/actions/meals';
import type { FoodItem, Goal, MacroTargets, NutritionProfile } from '@/lib/nutrition/types';

interface MealRow {
  id: string; type: string; food: string; grams: number | null;
  calories: number | null; protein: number | null; carbs: number | null; fat: number | null;
}

interface Props {
  profile: NutritionProfile & { name?: string | null };
  targets: MacroTargets | null;
  todayTotals: MacroTargets;
  meals: MealRow[];
  customFoods: FoodItem[];
  aiEnabled: boolean;
}

type Tab = 'hoje' | 'alimentos' | 'recomendacoes' | 'perfil';
const TABS: { id: Tab; label: string }[] = [
  { id: 'hoje', label: '🍽️ Hoje' },
  { id: 'alimentos', label: '📚 Alimentos' },
  { id: 'recomendacoes', label: '🌿 Recomendações' },
  { id: 'perfil', label: '👤 Perfil' },
];

const MACROS = [
  { key: 'protein' as const, label: 'Proteína', color: '#ffb6b9', tcolor: 'text-pink-700' },
  { key: 'carbs' as const, label: 'Carbos', color: '#a8e6cf', tcolor: 'text-teal-700' },
  { key: 'fat' as const, label: 'Gordura', color: '#fcd38a', tcolor: 'text-amber-700' },
];

export default function DietaClient({ profile, targets, todayTotals, meals, customFoods, aiEnabled }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('hoje');

  const goalKcal = targets?.kcal || 2000;
  const kcalPct = Math.min(100, (todayTotals.kcal / goalKcal) * 100);

  const removeMeal = async (id: string) => {
    await deleteMeal(id);
    router.refresh();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-4xl font-extrabold text-[#4a3f72]">Vitalis <span className="text-[#9871F5]">Nutri</span></h1>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${tab === t.id ? 'bg-[#9871F5] text-white shadow' : 'bg-white text-gray-500 clay-card'}`}>{t.label}</button>
          ))}
        </div>
      </header>

      {tab === 'hoje' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            {/* Resumo */}
            <div className="clay-card p-6 bg-white flex flex-col items-center">
              <ProgressRing value={kcalPct} size={170}>
                <span className="text-3xl font-extrabold text-[#4a3f72]">{todayTotals.kcal}</span>
                <span className="text-[10px] uppercase text-gray-400">de {goalKcal} kcal</span>
              </ProgressRing>
              {!targets && <p className="text-[11px] text-gray-400 mt-2 text-center">Preencha o Perfil para metas automáticas.</p>}
              <div className="w-full space-y-3 mt-5">
                {MACROS.map(m => {
                  const cur = (todayTotals as any)[m.key] as number;
                  const tgt = targets ? (targets as any)[m.key] as number : 0;
                  const pct = tgt ? Math.min(100, (cur / tgt) * 100) : 0;
                  return (
                    <div key={m.key}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className={m.tcolor}>{m.label}</span>
                        <span className="text-gray-500">{cur}{tgt ? ` / ${tgt}` : ''}g</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <MealBuilder customFoods={customFoods} aiEnabled={aiEnabled} />
          </div>

          {/* Refeições de hoje */}
          <div className="lg:col-span-2 clay-card p-6 bg-white">
            <h2 className="text-xl font-bold text-[#4a3f72] mb-5">Refeições de hoje</h2>
            <div className="space-y-3">
              {meals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-purple-900/40">
                  <span className="text-4xl mb-3">🍽️</span>
                  <p className="font-bold">Nada registrado ainda.</p>
                </div>
              )}
              {meals.map(m => (
                <div key={m.id} className="clay-card p-4 flex justify-between items-center bg-gray-50/50 group">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded-md uppercase tracking-wider">{m.type}</span>
                    <p className="font-extrabold text-[#4a3f72] mt-2">{m.food}{m.grams ? <span className="text-gray-400 font-semibold text-sm"> · {m.grams}g</span> : null}</p>
                    <div className="flex gap-3 mt-1 text-xs font-bold text-gray-500">
                      {m.calories ? <span>🔥 {m.calories} kcal</span> : null}
                      {m.protein ? <span>🥩 {m.protein}g</span> : null}
                      {m.carbs ? <span>🍚 {m.carbs}g</span> : null}
                      {m.fat ? <span>🥑 {m.fat}g</span> : null}
                    </div>
                  </div>
                  <button onClick={() => removeMeal(m.id)} className="w-8 h-8 rounded-full bg-red-100 text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'alimentos' && <div className="clay-card p-6 bg-white"><FoodLibrary customFoods={customFoods} /></div>}
      {tab === 'recomendacoes' && <div className="clay-card p-6 bg-white"><Recommendations defaultGoal={(profile.goal as Goal) || undefined} /></div>}
      {tab === 'perfil' && <ProfileForm profile={profile} />}
    </div>
  );
}
