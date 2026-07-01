export type DietSex = 'male' | 'female';
export type DietGoal = 'cut' | 'maintain' | 'bulk';
export type DietActivity = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type DietStyle = 'onivoro' | 'vegetariano' | 'vegano' | 'low_carb' | 'cetogenica';

export interface MacroTargets {
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
}

const ACTIVITY: Record<DietActivity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

const GOAL_ADJUST: Record<DietGoal, number> = { cut: 0.8, maintain: 1.0, bulk: 1.1 };

const MIN_KCAL: Record<DietSex, number> = { male: 1500, female: 1200 };

/**
 * Metas determinísticas (BMR Mifflin-St Jeor → TDEE → ajuste de meta).
 * Fonte de verdade dos números — a IA nunca decide kcal/macros, só preenche o cardápio.
 */
export function computeTargets(p: {
  sex: DietSex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: DietActivity;
  goal: DietGoal;
}): MacroTargets {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  const bmr = p.sex === 'male' ? base + 5 : base - 161;
  const tdee = bmr * ACTIVITY[p.activity];
  const rawKcal = Math.round((tdee * GOAL_ADJUST[p.goal]) / 10) * 10;
  const kcal = Math.max(rawKcal, MIN_KCAL[p.sex]);

  const proteinG = Math.round((p.goal === 'bulk' ? 1.8 : 2.0) * p.weightKg);
  const fatG = Math.round(0.9 * p.weightKg);
  const carbG = Math.max(0, Math.round((kcal - (proteinG * 4 + fatG * 9)) / 4));

  return { kcal, proteinG, carbG, fatG };
}

/** Alerta se a meta ficou agressiva demais (déficit/superávit fora do razoável). */
export function isAggressiveGoal(rawKcal: number, sex: DietSex): boolean {
  return rawKcal < MIN_KCAL[sex];
}

/** Split padrão de kcal por refeição, conforme a quantidade de refeições/dia. */
const MEAL_SPLITS: Record<number, { type: string; label: string; pct: number }[]> = {
  3: [
    { type: 'cafe', label: 'Café da manhã', pct: 0.3 },
    { type: 'almoco', label: 'Almoço', pct: 0.4 },
    { type: 'jantar', label: 'Jantar', pct: 0.3 },
  ],
  4: [
    { type: 'cafe', label: 'Café da manhã', pct: 0.25 },
    { type: 'almoco', label: 'Almoço', pct: 0.35 },
    { type: 'lanche', label: 'Lanche', pct: 0.1 },
    { type: 'jantar', label: 'Jantar', pct: 0.3 },
  ],
  5: [
    { type: 'cafe', label: 'Café da manhã', pct: 0.2 },
    { type: 'lanche_manha', label: 'Lanche da manhã', pct: 0.1 },
    { type: 'almoco', label: 'Almoço', pct: 0.3 },
    { type: 'lanche', label: 'Lanche da tarde', pct: 0.15 },
    { type: 'jantar', label: 'Jantar', pct: 0.25 },
  ],
  6: [
    { type: 'cafe', label: 'Café da manhã', pct: 0.18 },
    { type: 'lanche_manha', label: 'Lanche da manhã', pct: 0.1 },
    { type: 'almoco', label: 'Almoço', pct: 0.28 },
    { type: 'lanche', label: 'Lanche da tarde', pct: 0.12 },
    { type: 'jantar', label: 'Jantar', pct: 0.22 },
    { type: 'ceia', label: 'Ceia', pct: 0.1 },
  ],
};

export function mealSplit(mealsPerDay: number) {
  return MEAL_SPLITS[mealsPerDay] ?? MEAL_SPLITS[4];
}
