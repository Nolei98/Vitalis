import React, { useState, useMemo } from 'react';
import { ActivityLevel, Goal, Sex, UserProfile } from '../../types';
import { ACTIVITY_LABELS, GOAL_LABELS, computeProfileSummary, computeTargets } from '../../utils/nutrition';
import FloatingDecor from '../ui/FloatingDecor';

interface OnboardingFormProps {
  user: UserProfile;
  onComplete: (u: UserProfile) => void;
}

const ACTIVITIES: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const GOALS: Goal[] = ['hipertrofia', 'emagrecimento', 'manutencao'];

const OnboardingForm: React.FC<OnboardingFormProps> = ({ user, onComplete }) => {
  const [sex, setSex] = useState<Sex>(user.sex || 'male');
  const [age, setAge] = useState<string>(user.age?.toString() || '');
  const [heightCm, setHeightCm] = useState<string>(user.heightCm?.toString() || '');
  const [weightKg, setWeightKg] = useState<string>(user.weightKg?.toString() || '');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(user.activityLevel || 'moderate');
  const [goal, setGoal] = useState<Goal>(user.goal || 'manutencao');

  const draft: UserProfile = useMemo(
    () => ({ ...user, sex, age: Number(age) || 0, heightCm: Number(heightCm) || 0, weightKg: Number(weightKg) || 0, activityLevel, goal }),
    [user, sex, age, heightCm, weightKg, activityLevel, goal]
  );

  const summary = useMemo(() => computeProfileSummary(draft), [draft]);
  const isValid = Number(age) > 0 && Number(heightCm) > 0 && Number(weightKg) > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onComplete({ ...draft, targets: computeTargets(draft) || undefined });
  };

  const input = 'w-full px-5 py-4 rounded-[20px] bg-surface-soft font-semibold text-ink-strong outline-none placeholder:text-ink-soft/50';
  const label = 'block text-[10px] font-extrabold text-ink-soft mb-1.5 ml-2 uppercase tracking-[0.15em]';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <FloatingDecor />
      <div className="relative w-full max-w-5xl card-fresh p-8 md:p-12 animate-fadeInUp">
        <div className="text-center mb-8">
          <span className="inline-flex items-center justify-center w-14 h-14 capsule rounded-full text-2xl mb-3">🌿</span>
          <h1 className="text-3xl font-extrabold text-ink-strong tracking-tight">Vamos calibrar seu plano</h1>
          <p className="text-sm text-ink-soft font-medium mt-1">Calculamos sua TMB, GET e metas de macros automaticamente.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DADOS */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className={label}>Sexo biológico</label>
              <div className="flex gap-3">
                {(['male', 'female'] as Sex[]).map(s => (
                  <button type="button" key={s} onClick={() => setSex(s)} className={`flex-1 py-4 rounded-[18px] text-[11px] font-extrabold uppercase tracking-wider transition press ${sex === s ? 'bg-green-700 text-white shadow-soft' : 'bg-surface-soft text-ink-soft'}`}>
                    {s === 'male' ? 'Masculino' : 'Feminino'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={label}>Idade</label>
                <input type="number" min="1" className={input} value={age} onChange={e => setAge(e.target.value)} placeholder="anos" />
              </div>
              <div>
                <label className={label}>Altura</label>
                <input type="number" min="1" className={input} value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="cm" />
              </div>
              <div>
                <label className={label}>Peso</label>
                <input type="number" min="1" step="0.1" className={input} value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="kg" />
              </div>
            </div>

            <div>
              <label className={label}>Nível de atividade</label>
              <select className={input} value={activityLevel} onChange={e => setActivityLevel(e.target.value as ActivityLevel)}>
                {ACTIVITIES.map(a => <option key={a} value={a}>{ACTIVITY_LABELS[a]}</option>)}
              </select>
            </div>

            <div>
              <label className={label}>Objetivo</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {GOALS.map(g => (
                  <button type="button" key={g} onClick={() => setGoal(g)} className={`py-4 px-3 rounded-[18px] text-[10px] font-extrabold uppercase tracking-wider transition press ${goal === g ? 'bg-green-700 text-white shadow-soft' : 'bg-surface-soft text-ink-soft'}`}>
                    {g === 'hipertrofia' ? 'Hipertrofia' : g === 'emagrecimento' ? 'Emagrecer' : 'Manutenção'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] font-medium text-ink-soft mt-2 ml-2">{GOAL_LABELS[goal]}</p>
            </div>
          </div>

          {/* RESULTADO */}
          <div className="bg-signature rounded-[28px] p-7 text-white flex flex-col justify-between relative overflow-hidden">
            <FloatingDecor variant="dark" />
            <div className="relative z-10 space-y-5">
              <h3 className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-lime-300">Prévia do cálculo</h3>
              {summary ? (
                <>
                  <div>
                    <p className="text-2xl font-extrabold italic leading-none">{summary.bmr}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-1">TMB · basal</p>
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold italic leading-none">{summary.tdee}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-1">GET · gasto total</p>
                  </div>
                  <div className="pt-3 border-t border-white/15">
                    <p className="text-5xl font-extrabold italic leading-none text-lime-300">{summary.targets.kcal}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mt-1">meta diária (kcal)</p>
                  </div>
                  <div className="flex gap-2 text-center">
                    {[['P', summary.targets.protein], ['C', summary.targets.carbs], ['G', summary.targets.fat]].map(([k, v]) => (
                      <div key={k as string} className="flex-1 bg-white/8 rounded-2xl py-3">
                        <p className="text-base font-extrabold italic">{v}g</p>
                        <p className="text-[8px] font-bold uppercase text-white/40">{k}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/50 italic">Preencha idade, altura e peso para ver suas metas.</p>
              )}
            </div>
            <button type="submit" disabled={!isValid} className="relative z-10 btn-pill press w-full mt-7 py-4 bg-accent-500 text-white font-extrabold uppercase tracking-[0.15em] text-xs shadow-glow disabled:opacity-40" style={{ borderRadius: 999 }}>
              Salvar e começar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingForm;
