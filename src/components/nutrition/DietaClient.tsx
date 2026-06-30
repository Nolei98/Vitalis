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
import ModIcon from '@/components/ModIcon';

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
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      {/* Header + tabs fixos */}
      <header className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ModIcon mod="dieta" size="lg" />
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--clay-text)' }}>
              Vitalis <span style={{ color: 'var(--mod-dieta)' }}>Nutri</span>
            </h1>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all"
              style={tab === t.id
                ? { background: 'var(--mod-dieta)', color: 'white' }
                : { background: 'var(--clay-surface)', color: 'var(--clay-text-soft)', boxShadow: 'var(--clay-shadow)' }
              }
            >{t.label}</button>
          ))}
        </div>
      </header>

      {/* Conteúdo rola internamente */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">

        {tab === 'hoje' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Esquerda: resumo + add refeição */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="clay-card p-5 flex flex-col items-center">
                <ProgressRing value={kcalPct} size={160}>
                  <span className="text-3xl font-extrabold" style={{ color: 'var(--clay-text)' }}>{todayTotals.kcal}</span>
                  <span className="text-[10px] uppercase" style={{ color: 'var(--clay-text-mute)' }}>de {goalKcal} kcal</span>
                </ProgressRing>
                {!targets && (
                  <p className="text-[11px] mt-2 text-center" style={{ color: 'var(--clay-text-mute)' }}>
                    Preencha o Perfil para metas automáticas.
                  </p>
                )}
                <div className="w-full space-y-3 mt-4">
                  {MACROS.map(m => {
                    const cur = (todayTotals as any)[m.key] as number;
                    const tgt = targets ? (targets as any)[m.key] as number : 0;
                    const pct = tgt ? Math.min(100, (cur / tgt) * 100) : 0;
                    return (
                      <div key={m.key}>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className={m.tcolor}>{m.label}</span>
                          <span style={{ color: 'var(--clay-text-soft)' }}>{cur}{tgt ? ` / ${tgt}` : ''}g</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--clay-sunken)' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <MealBuilder customFoods={customFoods} aiEnabled={aiEnabled} />
            </div>

            {/* Direita: lista de refeições com scroll interno */}
            <div className="lg:col-span-2 clay-card p-5 flex flex-col min-h-[300px] lg:min-h-0">
              <h2 className="text-base font-extrabold mb-4 flex-shrink-0" style={{ color: 'var(--clay-text)' }}>
                Refeições de hoje
              </h2>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                {meals.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12" style={{ color: 'var(--clay-text-mute)' }}>
                    <span className="text-4xl mb-3">🍽️</span>
                    <p className="font-bold">Nada registrado ainda.</p>
                  </div>
                )}
                {meals.map(m => (
                  <div key={m.id} className="clay-card p-3 flex justify-between items-center group"
                    style={{ background: 'var(--clay-surface-2)' }}>
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                        style={{ background: 'var(--mod-dieta-bg)', color: 'var(--mod-dieta-strong)' }}>{m.type}</span>
                      <p className="font-extrabold mt-1.5 text-sm" style={{ color: 'var(--clay-text)' }}>
                        {m.food}{m.grams ? <span className="font-semibold text-xs" style={{ color: 'var(--clay-text-mute)' }}> · {m.grams}g</span> : null}
                      </p>
                      <div className="flex gap-3 mt-1 text-xs font-bold" style={{ color: 'var(--clay-text-soft)' }}>
                        {m.calories ? <span>🔥 {m.calories} kcal</span> : null}
                        {m.protein ? <span>🥩 {m.protein}g</span> : null}
                        {m.carbs ? <span>🍚 {m.carbs}g</span> : null}
                        {m.fat ? <span>🥑 {m.fat}g</span> : null}
                      </div>
                    </div>
                    <button onClick={() => removeMeal(m.id)}
                      className="w-8 h-8 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: '#FFE5E9', color: '#D94060' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'alimentos' && <div className="clay-card p-5"><FoodLibrary customFoods={customFoods} /></div>}
        {tab === 'recomendacoes' && <div className="clay-card p-5"><Recommendations defaultGoal={(profile.goal as Goal) || undefined} /></div>}
        {tab === 'perfil' && <ProfileForm profile={profile} />}

      </div>
    </div>
  );
}
