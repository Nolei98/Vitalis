import { ActivityLevel, Goal, MacroTargets, UserProfile } from '../types';

/** Calorias a partir dos macros (regra 4-4-9). Centraliza o cálculo usado em todo o app. */
export const kcalFromMacros = (proteinG: number, carbsG: number, fatG: number): number =>
  Math.round(proteinG * 4 + carbsG * 4 + fatG * 9);

/** Taxa Metabólica Basal — equação de Mifflin-St Jeor. */
export const bmrMifflinStJeor = (p: {
  sex: 'male' | 'female';
  weightKg: number;
  heightCm: number;
  age: number;
}): number => {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(base + (p.sex === 'male' ? 5 : -161));
};

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentário (pouco ou nenhum exercício)',
  light: 'Leve (1-3x por semana)',
  moderate: 'Moderado (3-5x por semana)',
  active: 'Ativo (6-7x por semana)',
  very_active: 'Muito ativo (treino pesado/2x ao dia)',
};

export const GOAL_LABELS: Record<Goal, string> = {
  hipertrofia: 'Hipertrofia (ganho de massa)',
  emagrecimento: 'Emagrecimento (perda de gordura)',
  manutencao: 'Manutenção (manter o peso)',
};

/** Gasto Energético Total = TMB × multiplicador de atividade. */
export const tdee = (bmr: number, activityLevel: ActivityLevel): number =>
  Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);

/** Ajuste calórico conforme o objetivo: déficit, manutenção ou superávit. */
export const calorieTargetForGoal = (tdeeValue: number, goal: Goal): number => {
  const factor = goal === 'emagrecimento' ? 0.8 : goal === 'hipertrofia' ? 1.12 : 1;
  return Math.round(tdeeValue * factor);
};

/** Proteína-alvo por kg de peso conforme o objetivo. */
const PROTEIN_PER_KG: Record<Goal, number> = {
  hipertrofia: 2.0,
  emagrecimento: 2.2,
  manutencao: 1.8,
};

/** Distribui as calorias-alvo em gramas de proteína, carboidrato e gordura. */
export const macroSplitForGoal = (p: {
  kcalTarget: number;
  weightKg: number;
  goal: Goal;
}): MacroTargets => {
  const protein = Math.round(PROTEIN_PER_KG[p.goal] * p.weightKg);
  // Gordura: ~25% das kcal (manutenção usa 30%).
  const fatPct = p.goal === 'manutencao' ? 0.3 : 0.25;
  const fat = Math.round((p.kcalTarget * fatPct) / 9);
  const remainingKcal = p.kcalTarget - (protein * 4 + fat * 9);
  const carbs = Math.max(0, Math.round(remainingKcal / 4));
  return { kcal: p.kcalTarget, protein, carbs, fat };
};

/** True quando o perfil já tem os dados físicos necessários para calcular metas. */
export const hasPhysicalProfile = (u: UserProfile | null | undefined): boolean =>
  !!(u && u.sex && u.age && u.heightCm && u.weightKg && u.activityLevel && u.goal);

/** Orquestra TMB → GET → ajuste por objetivo → split de macros. */
export const computeTargets = (u: UserProfile): MacroTargets | null => {
  if (!hasPhysicalProfile(u)) return null;
  const bmr = bmrMifflinStJeor({
    sex: u.sex!,
    weightKg: u.weightKg!,
    heightCm: u.heightCm!,
    age: u.age!,
  });
  const get = tdee(bmr, u.activityLevel!);
  const kcalTarget = calorieTargetForGoal(get, u.goal!);
  return macroSplitForGoal({ kcalTarget, weightKg: u.weightKg!, goal: u.goal! });
};

/** Resumo dos números intermediários — útil para exibir no onboarding. */
export const computeProfileSummary = (u: UserProfile) => {
  if (!hasPhysicalProfile(u)) return null;
  const bmr = bmrMifflinStJeor({
    sex: u.sex!,
    weightKg: u.weightKg!,
    heightCm: u.heightCm!,
    age: u.age!,
  });
  const get = tdee(bmr, u.activityLevel!);
  const targets = macroSplitForGoal({
    kcalTarget: calorieTargetForGoal(get, u.goal!),
    weightKg: u.weightKg!,
    goal: u.goal!,
  });
  return { bmr, tdee: get, targets };
};
