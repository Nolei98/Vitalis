'use client';

import React, { useMemo, useState } from 'react';
import { Bot } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FOOD_DATABASE } from '@/lib/nutrition/foods';
import { kcalFromMacros } from '@/lib/nutrition/calc';
import { foodEmoji } from '@/lib/nutrition/emoji';
import type { FoodItem } from '@/lib/nutrition/types';
import { addMealItems, analyzeMealAI, type MealItemInput } from '@/app/actions/nutrition';

const MEAL_TYPES = ['Café da Manhã', 'Almoço', 'Lanche', 'Jantar'];

interface Props {
  customFoods: FoodItem[];
  aiEnabled: boolean;
}

interface Pending extends MealItemInput {
  key: string;
}

export default function MealBuilder({ customFoods, aiEnabled }: Props) {
  const router = useRouter();
  const foods = useMemo<FoodItem[]>(() => [...customFoods, ...FOOD_DATABASE], [customFoods]);

  const [type, setType] = useState(MEAL_TYPES[0]);
  const [foodId, setFoodId] = useState('');
  const [grams, setGrams] = useState(100);
  const [items, setItems] = useState<Pending[]>([]);
  const [saving, setSaving] = useState(false);

  const [desc, setDesc] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMsg, setAiMsg] = useState('');

  const addManual = () => {
    const food = foods.find(f => String(f.id) === foodId);
    if (!food) return;
    const g = Math.max(1, grams);
    const ratio = g / 100;
    const protein = +(food.proteinG * ratio).toFixed(1);
    const carbs = +(food.carbsG * ratio).toFixed(1);
    const fat = +(food.fatG * ratio).toFixed(1);
    setItems(prev => [...prev, {
      key: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type, food: food.name, grams: g, foodId: String(food.id),
      protein, carbs, fat, calories: kcalFromMacros(protein, carbs, fat),
    }]);
    setFoodId('');
    setGrams(100);
  };

  const analyze = async () => {
    if (!desc.trim()) return;
    setAiLoading(true);
    setAiMsg('');
    const r = await analyzeMealAI(desc.trim());
    setAiLoading(false);
    if (!r) { setAiMsg('Não foi possível analisar (verifique a chave Gemini no .env).'); return; }
    setItems(prev => [...prev, {
      key: `ai-${Date.now()}`,
      type, food: `${r.name} (IA)`, grams: 0,
      protein: Math.round(r.proteinG), carbs: Math.round(r.carbsG), fat: Math.round(r.fatG),
      calories: Math.round(r.energyKcal || kcalFromMacros(r.proteinG, r.carbsG, r.fatG)),
    }]);
    if (r.advice) setAiMsg('✦ ' + r.advice);
    setDesc('');
  };

  const total = items.reduce((a, i) => a + (i.calories || 0), 0);

  const save = async () => {
    if (!items.length) return;
    setSaving(true);
    await addMealItems(items.map(({ key, ...rest }) => rest));
    setItems([]);
    setSaving(false);
    router.refresh();
  };

  const input = 'clay-card px-4 py-3 text-gray-700 outline-none bg-white';

  return (
    <div className="clay-panel !bg-[#fce38a] p-6 text-amber-950 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Montar Refeição</h2>
        <select value={type} onChange={e => setType(e.target.value)} className={`${input} text-sm`}>
          {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* IA */}
      <div className="bg-white/60 rounded-2xl p-4 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-amber-800"><Bot size={13} strokeWidth={2} className="inline-block mr-1" /> Descrever refeição (IA)</label>
        <textarea
          rows={2}
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder={aiEnabled ? 'Ex: 2 ovos fritos e uma fatia de pão integral...' : 'IA desativada (defina GEMINI_API_KEY)'}
          disabled={!aiEnabled}
          className="w-full clay-card px-4 py-3 text-gray-700 outline-none bg-white resize-none disabled:opacity-50"
        />
        <button type="button" onClick={analyze} disabled={!aiEnabled || aiLoading || !desc.trim()} className="clay-btn bg-white px-5 py-2 rounded-xl font-extrabold text-amber-600 text-sm disabled:opacity-40">
          {aiLoading ? 'Analisando...' : 'Estimar macros'}
        </button>
        {aiMsg && <p className="text-xs font-semibold text-amber-900">{aiMsg}</p>}
      </div>

      {/* Seleção manual */}
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold uppercase tracking-wider text-amber-800 ml-1">Alimento</label>
          <select value={foodId} onChange={e => setFoodId(e.target.value)} className={`${input} w-full mt-1`}>
            <option value="">Selecione...</option>
            {foods.map(f => (
              <option key={f.id} value={f.id}>{foodEmoji(f.name, f.category)} {f.name}{f.brand ? ` (${f.brand})` : ''}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-24">
          <label className="text-[10px] font-bold uppercase tracking-wider text-amber-800 ml-1">g/ml</label>
          <input type="number" min={1} value={grams} onChange={e => setGrams(Math.max(1, Number(e.target.value)))} className={`${input} w-full mt-1 text-center`} />
        </div>
        <button type="button" onClick={addManual} disabled={!foodId} className="clay-btn bg-white w-12 h-12 rounded-xl font-extrabold text-amber-600 text-2xl disabled:opacity-40">+</button>
      </div>

      {/* Itens pendentes */}
      {items.length > 0 && (
        <div className="bg-white/70 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-amber-900">{items.length} itens</span>
            <span className="text-lg font-extrabold text-amber-900">{total} kcal</span>
          </div>
          <div className="space-y-2 max-h-44 overflow-y-auto no-scrollbar">
            {items.map(it => (
              <div key={it.key} className="flex justify-between items-center bg-white rounded-xl px-3 py-2 text-sm">
                <span className="font-bold text-gray-700 truncate">{it.food}{it.grams ? ` · ${it.grams}g` : ''}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{it.calories} kcal</span>
                  <button onClick={() => setItems(prev => prev.filter(p => p.key !== it.key))} className="text-red-400 font-bold">×</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={save} disabled={saving} className="clay-btn bg-white w-full py-3 rounded-xl font-extrabold text-amber-600 mt-1">
            {saving ? 'Salvando...' : 'Registrar no diário +'}
          </button>
        </div>
      )}
    </div>
  );
}
