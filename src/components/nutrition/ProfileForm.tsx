'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ACTIVITY_LABELS, GOAL_LABELS, computeProfileSummary } from '@/lib/nutrition/calc';
import type { ActivityLevel, Goal, NutritionProfile, Sex } from '@/lib/nutrition/types';
import { saveNutritionProfile } from '@/app/actions/nutrition';

const ACTIVITIES: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const GOALS: Goal[] = ['hipertrofia', 'emagrecimento', 'manutencao'];

interface Props { profile: NutritionProfile; }

export default function ProfileForm({ profile }: Props) {
  const router = useRouter();
  const [sex, setSex] = useState<Sex>((profile.sex as Sex) || 'male');
  const [age, setAge] = useState(profile.age?.toString() || '');
  const [heightCm, setHeightCm] = useState(profile.heightCm?.toString() || '');
  const [weightKg, setWeightKg] = useState(profile.weightKg?.toString() || '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>((profile.activityLevel as ActivityLevel) || 'moderate');
  const [goal, setGoal] = useState<Goal>((profile.goal as Goal) || 'manutencao');

  const summary = useMemo(() => computeProfileSummary({
    sex, age: Number(age) || 0, heightCm: Number(heightCm) || 0, weightKg: Number(weightKg) || 0, activityLevel, goal,
  }), [sex, age, heightCm, weightKg, activityLevel, goal]);

  const input = 'clay-card px-4 py-3 text-gray-700 outline-none bg-white w-full';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form
        action={async (fd: FormData) => { await saveNutritionProfile(fd); router.refresh(); }}
        className="lg:col-span-2 clay-card p-6 bg-white space-y-4"
      >
        <h3 className="font-bold text-[#4a3f72] text-lg">Perfil físico</h3>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Sexo</label>
          <div className="flex gap-3 mt-1">
            {(['male', 'female'] as Sex[]).map(s => (
              <button type="button" key={s} onClick={() => setSex(s)} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${sex === s ? 'bg-[#9871F5] text-white shadow' : 'bg-gray-100 text-gray-500'}`}>
                {s === 'male' ? 'Masculino' : 'Feminino'}
              </button>
            ))}
          </div>
          <input type="hidden" name="sex" value={sex} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Idade</label>
            <input name="age" type="number" min={1} value={age} onChange={e => setAge(e.target.value)} className={`${input} mt-1`} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Altura (cm)</label>
            <input name="heightCm" type="number" min={1} value={heightCm} onChange={e => setHeightCm(e.target.value)} className={`${input} mt-1`} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Peso (kg)</label>
            <input name="weightKg" type="number" min={1} step="0.1" value={weightKg} onChange={e => setWeightKg(e.target.value)} className={`${input} mt-1`} />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Nível de atividade</label>
          <select name="activityLevel" value={activityLevel} onChange={e => setActivityLevel(e.target.value as ActivityLevel)} className={`${input} mt-1`}>
            {ACTIVITIES.map(a => <option key={a} value={a}>{ACTIVITY_LABELS[a]}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Objetivo</label>
          <select name="goal" value={goal} onChange={e => setGoal(e.target.value as Goal)} className={`${input} mt-1`}>
            {GOALS.map(g => <option key={g} value={g}>{GOAL_LABELS[g]}</option>)}
          </select>
        </div>

        <button type="submit" className="clay-btn bg-[#9871F5] text-white w-full py-3 rounded-xl font-extrabold">Salvar e calcular metas</button>
      </form>

      <div className="clay-panel p-6 text-white space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-100">Prévia do cálculo</h3>
        {summary ? (
          <>
            <div><p className="text-3xl font-extrabold">{summary.bmr}</p><p className="text-[10px] uppercase text-purple-200">TMB (basal)</p></div>
            <div><p className="text-3xl font-extrabold">{summary.tdee}</p><p className="text-[10px] uppercase text-purple-200">GET (gasto total)</p></div>
            <div className="pt-3 border-t border-white/20">
              <p className="text-4xl font-extrabold">{summary.targets.kcal}</p>
              <p className="text-[10px] uppercase text-purple-200">Meta diária (kcal)</p>
            </div>
            <div className="flex gap-2 text-center">
              <div className="flex-1 bg-white/15 rounded-xl py-2"><p className="font-extrabold">{summary.targets.protein}g</p><p className="text-[9px] text-purple-200">Prot</p></div>
              <div className="flex-1 bg-white/15 rounded-xl py-2"><p className="font-extrabold">{summary.targets.carbs}g</p><p className="text-[9px] text-purple-200">Carb</p></div>
              <div className="flex-1 bg-white/15 rounded-xl py-2"><p className="font-extrabold">{summary.targets.fat}g</p><p className="text-[9px] text-purple-200">Gord</p></div>
            </div>
          </>
        ) : (
          <p className="text-sm text-purple-100/80 italic">Preencha idade, altura e peso para ver suas metas.</p>
        )}
      </div>
    </div>
  );
}
