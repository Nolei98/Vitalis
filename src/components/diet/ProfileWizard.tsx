'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { saveDietProfile, startDietPlan, generatePlanMeal, type DietProfileInput } from '@/app/actions/diet';
import { mealSplit } from '@/lib/diet/targets';
import type { NutritionGoalOption } from './types';

const RESTRICTION_OPTIONS = ['gluten', 'lactose', 'amendoim', 'ovo', 'frutos_do_mar', 'peixe', 'soja'];
const RESTRICTION_LABEL: Record<string, string> = {
  gluten: 'Glúten', lactose: 'Lactose', amendoim: 'Amendoim', ovo: 'Ovo',
  frutos_do_mar: 'Frutos do mar', peixe: 'Peixe', soja: 'Soja',
};

function textToArr(s: string): string[] {
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

export default function ProfileWizard({ nutritionGoals }: { nutritionGoals: NutritionGoalOption[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [goal, setGoal] = useState<'cut' | 'maintain' | 'bulk'>('maintain');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState(30);
  const [weightKg, setWeightKg] = useState(75);
  const [heightCm, setHeightCm] = useState(175);
  const [activity, setActivity] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'athlete'>('moderate');
  const [style, setStyle] = useState<'onivoro' | 'vegetariano' | 'vegano' | 'low_carb' | 'cetogenica'>('onivoro');
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [preferredText, setPreferredText] = useState('');
  const [dislikedText, setDislikedText] = useState('');
  const [availableText, setAvailableText] = useState('');
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [budget, setBudget] = useState<'economico' | 'moderado' | 'sem_restricao'>('moderado');
  const [goalId, setGoalId] = useState('');
  const [progress, setProgress] = useState<string | null>(null);

  const steps = ['Meta', 'Corpo', 'Estilo & restrições', 'Alimentos', 'Refeições/dia'];

  function toggleRestriction(r: string) {
    setRestrictions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const input: DietProfileInput = {
          goal, sex, age, weightKg, heightCm, activity, style,
          restrictions, mealsPerDay, budget,
          preferred: textToArr(preferredText), disliked: textToArr(dislikedText), available: textToArr(availableText),
        };
        await saveDietProfile(input);
        const plan = await startDietPlan({ goalId: goalId || undefined });
        // Gera refeição a refeição (chamadas curtas de ~10-20s) em vez de 1 dia ou
        // a semana inteira numa chamada só — isso evita estourar o timeout de
        // Server Action da hospedagem (Vercel Hobby mata em ~10-60s).
        const split = mealSplit(mealsPerDay);
        for (let weekday = 0; weekday < 7; weekday++) {
          for (let i = 0; i < split.length; i++) {
            setProgress(`Gerando dia ${weekday + 1}/7 — refeição ${i + 1}/${split.length}…`);
            await generatePlanMeal(plan.id, weekday, split[i].type, i);
          }
        }
        setProgress(null);
        router.refresh();
      } catch (e) {
        setProgress(null);
        setError(e instanceof Error ? e.message : 'Erro ao gerar o plano.');
      }
    });
  }

  return (
    <div className="clay-card p-6 space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Sparkles size={18} strokeWidth={2.2} style={{ color: 'var(--mod-dieta)' }} />
        <h2 className="text-lg font-extrabold" style={{ color: 'var(--clay-text)' }}>Criar plano de dieta</h2>
      </div>

      <div className="flex items-center gap-1.5">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 h-1.5 rounded-full" style={{ background: i <= step ? 'var(--mod-dieta)' : 'var(--clay-sunken)' }} />
        ))}
      </div>
      <p className="text-xs font-bold" style={{ color: 'var(--mod-dieta-strong)' }}>{steps[step]}</p>

      {step === 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(['cut', 'maintain', 'bulk'] as const).map((g) => (
              <button key={g} onClick={() => setGoal(g)}
                className="clay-btn py-2.5 text-sm font-bold"
                style={goal === g ? { background: 'var(--mod-dieta)', color: 'white' } : { background: 'var(--clay-surface)', color: 'var(--clay-text-soft)' }}>
                {g === 'cut' ? 'Emagrecer' : g === 'maintain' ? 'Manter' : 'Ganhar massa'}
              </button>
            ))}
          </div>
          <p className="text-[11px] font-medium text-gray-400">
            O plano não tem data de término — ele gira em torno dessa meta e só muda quando você pede
            (regenerar, recalibrar) ou encerra manualmente.
          </p>
          {nutritionGoals.length > 0 && (
            <label className="block text-xs font-bold text-gray-500">
              Vincular a uma meta existente (opcional)
              <select value={goalId} onChange={(e) => setGoalId(e.target.value)}
                className="clay-card w-full px-3 py-2 text-sm outline-none border-none mt-1">
                <option value="">Nenhuma</option>
                {nutritionGoals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </label>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex gap-2 col-span-2">
            {(['male', 'female'] as const).map((s) => (
              <button key={s} onClick={() => setSex(s)} className="flex-1 clay-btn py-2 text-sm font-bold"
                style={sex === s ? { background: 'var(--mod-dieta)', color: 'white' } : { background: 'var(--clay-surface)', color: 'var(--clay-text-soft)' }}>
                {s === 'male' ? 'Masculino' : 'Feminino'}
              </button>
            ))}
          </div>
          <label className="text-xs font-bold text-gray-500">Idade
            <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="clay-card w-full px-3 py-2 text-sm outline-none border-none mt-1" />
          </label>
          <label className="text-xs font-bold text-gray-500">Peso (kg)
            <input type="number" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} className="clay-card w-full px-3 py-2 text-sm outline-none border-none mt-1" />
          </label>
          <label className="text-xs font-bold text-gray-500 col-span-2">Altura (cm)
            <input type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} className="clay-card w-full px-3 py-2 text-sm outline-none border-none mt-1" />
          </label>
          <label className="text-xs font-bold text-gray-500 col-span-2">Nível de atividade
            <select value={activity} onChange={(e) => setActivity(e.target.value as typeof activity)} className="clay-card w-full px-3 py-2 text-sm outline-none border-none mt-1">
              <option value="sedentary">Sedentário</option>
              <option value="light">Leve (1-3x/semana)</option>
              <option value="moderate">Moderado (3-5x/semana)</option>
              <option value="active">Ativo (6-7x/semana)</option>
              <option value="athlete">Atleta</option>
            </select>
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500">Estilo alimentar
            <select value={style} onChange={(e) => setStyle(e.target.value as typeof style)} className="clay-card w-full px-3 py-2 text-sm outline-none border-none mt-1">
              <option value="onivoro">Onívoro</option>
              <option value="vegetariano">Vegetariano</option>
              <option value="vegano">Vegano</option>
              <option value="low_carb">Low-carb</option>
              <option value="cetogenica">Cetogênica</option>
            </select>
          </label>
          <p className="text-xs font-bold text-gray-500">Restrições / alergias</p>
          <div className="flex flex-wrap gap-2">
            {RESTRICTION_OPTIONS.map((r) => (
              <button key={r} onClick={() => toggleRestriction(r)} type="button"
                className="clay-btn px-3 py-1.5 text-xs font-bold"
                style={restrictions.includes(r) ? { background: '#FB7185', color: 'white' } : { background: 'var(--clay-surface)', color: 'var(--clay-text-soft)' }}>
                {RESTRICTION_LABEL[r]}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500">Quais alimentos você quer incluir no plano? (separe por vírgula)
            <input value={preferredText} onChange={(e) => setPreferredText(e.target.value)} placeholder="frango, batata doce, banana"
              className="clay-card w-full px-3 py-2 text-sm outline-none border-none mt-1" />
          </label>
          <p className="text-[11px] font-medium text-gray-400">
            O que faltar pra bater sua meta de kcal/macros, a IA completa — priorizando o que você definir abaixo.
          </p>
          <label className="block text-xs font-bold text-gray-500">Ao completar o restante, priorizar
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['economico', 'moderado', 'sem_restricao'] as const).map((b) => (
                <button key={b} type="button" onClick={() => setBudget(b)}
                  className="clay-btn py-2 text-xs font-bold"
                  style={budget === b ? { background: 'var(--mod-dieta)', color: 'white' } : { background: 'var(--clay-surface)', color: 'var(--clay-text-soft)' }}>
                  {b === 'economico' ? 'Alimentos baratos' : b === 'moderado' ? 'Equilibrado' : 'Sem restrição'}
                </button>
              ))}
            </div>
          </label>
          <label className="block text-xs font-bold text-gray-500">Alimentos que odeia
            <input value={dislikedText} onChange={(e) => setDislikedText(e.target.value)} placeholder="brócolis, fígado"
              className="clay-card w-full px-3 py-2 text-sm outline-none border-none mt-1" />
          </label>
          <label className="block text-xs font-bold text-gray-500">Alimentos que já tem em casa
            <input value={availableText} onChange={(e) => setAvailableText(e.target.value)} placeholder="arroz, feijão, ovos"
              className="clay-card w-full px-3 py-2 text-sm outline-none border-none mt-1" />
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-500">Refeições por dia
            <select value={mealsPerDay} onChange={(e) => setMealsPerDay(Number(e.target.value))} className="clay-card w-full px-3 py-2 text-sm outline-none border-none mt-1">
              {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} refeições</option>)}
            </select>
          </label>
          <div className="rounded-2xl p-4 text-xs font-medium text-gray-500" style={{ background: 'var(--mod-dieta-bg)' }}>
            ⚠️ O plano gerado é uma sugestão educativa, não prescrição médica/nutricional. Não recomendamos déficits agressivos nem menos de ~1200 kcal sem acompanhamento profissional.
          </div>
        </div>
      )}

      {error && <p className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0 || isPending}
          className="clay-btn px-4 py-2 text-sm font-bold flex items-center gap-1 disabled:opacity-40" style={{ background: 'var(--clay-surface)', color: 'var(--clay-text-soft)' }}>
          <ChevronLeft size={14} /> Voltar
        </button>
        {step < steps.length - 1 ? (
          <button onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}
            className="clay-btn px-5 py-2 text-sm font-bold text-white flex items-center gap-1" style={{ background: 'var(--mod-dieta)' }}>
            Avançar <ChevronRight size={14} />
          </button>
        ) : (
          <button onClick={submit} disabled={isPending}
            className="clay-btn px-5 py-2 text-sm font-bold text-white disabled:opacity-60" style={{ background: 'var(--mod-dieta)' }}>
            {isPending ? (progress ?? 'Gerando plano…') : 'Gerar plano com IA'}
          </button>
        )}
      </div>
    </div>
  );
}
