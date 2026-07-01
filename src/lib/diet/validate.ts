import type { MacroTargets } from './targets';

export interface RawItem {
  name: string;
  quantityG: number;
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
}

export interface RawMeal {
  type: string;
  name: string;
  items: RawItem[];
}

export interface RawDay {
  weekday: number;
  meals: RawMeal[];
}

export interface RawWeekPlan {
  days: RawDay[];
}

const TOLERANCE = 0.1; // ±10%

const VALID_MEAL_TYPES = new Set(['cafe', 'lanche_manha', 'almoco', 'lanche', 'jantar', 'ceia']);
const MEAL_TYPE_ALIASES: Record<string, string> = {
  'café da manhã': 'cafe', 'cafe da manha': 'cafe', cafemanha: 'cafe', breakfast: 'cafe',
  'lanche da manhã': 'lanche_manha', 'lanche da manha': 'lanche_manha',
  almoço: 'almoco', lunch: 'almoco',
  'lanche da tarde': 'lanche', snack: 'lanche',
  jantar: 'jantar', dinner: 'jantar',
  ceia: 'ceia', supper: 'ceia',
};

/** Garante que o type venha numa das chaves esperadas mesmo se a IA fugir do enum. */
function normalizeMealType(type: string): string {
  const key = type.trim().toLowerCase();
  if (VALID_MEAL_TYPES.has(key)) return key;
  return MEAL_TYPE_ALIASES[key] ?? 'lanche';
}

/** Palavras-chave por restrição — filtro duro (não confia só no prompt). */
const RESTRICTION_KEYWORDS: Record<string, string[]> = {
  gluten: ['trigo', 'pão', 'pao', 'macarrão', 'macarrao', 'massa', 'cevada', 'centeio', 'aveia', 'cerveja', 'bolacha', 'biscoito'],
  lactose: ['leite', 'queijo', 'iogurte', 'requeijão', 'requeijao', 'manteiga', 'creme de leite', 'whey'],
  amendoim: ['amendoim', 'paçoca', 'pacoca', 'pé-de-moleque', 'pe-de-moleque'],
  ovo: ['ovo', 'ovos', 'maionese'],
  frutos_do_mar: ['camarão', 'camarao', 'lagosta', 'siri', 'ostra', 'mexilhão', 'mexilhao'],
  peixe: ['peixe', 'salmão', 'salmao', 'atum', 'tilápia', 'tilapia', 'sardinha', 'bacalhau'],
  soja: ['soja', 'tofu', 'shoyu', 'missô', 'misso'],
};

function violatesRestriction(itemName: string, restrictions: string[]): boolean {
  const lower = itemName.toLowerCase();
  return restrictions.some((r) => {
    const keywords = RESTRICTION_KEYWORDS[r.toLowerCase().trim()];
    if (!keywords) return false;
    return keywords.some((k) => lower.includes(k));
  });
}

function sumMeal(meal: RawMeal) {
  return meal.items.reduce(
    (a, i) => ({
      kcal: a.kcal + i.kcal,
      proteinG: a.proteinG + i.proteinG,
      carbG: a.carbG + i.carbG,
      fatG: a.fatG + i.fatG,
    }),
    { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 },
  );
}

function sumDay(day: RawDay) {
  return day.meals.reduce(
    (a, m) => {
      const s = sumMeal(m);
      return { kcal: a.kcal + s.kcal, proteinG: a.proteinG + s.proteinG, carbG: a.carbG + s.carbG, fatG: a.fatG + s.fatG };
    },
    { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 },
  );
}

/**
 * Remove itens que violam restrições/alergias (filtro duro, não depende só do prompt) e
 * reescala porções de cada dia pra ficar dentro da tolerância de ±10% do kcal-alvo.
 * Nunca inventa/edita macros por item — só aplica um fator de escala proporcional.
 */
export function validateAndRescale(plan: RawWeekPlan, targets: MacroTargets, restrictions: string[]): RawWeekPlan {
  const days = plan.days.map((day) => {
    const meals = day.meals.map((meal) => ({
      ...meal,
      type: normalizeMealType(meal.type),
      items: meal.items.filter((i) => !violatesRestriction(i.name, restrictions)),
    }));

    const totals = sumDay({ ...day, meals });
    if (totals.kcal <= 0) return { ...day, meals };

    const ratio = targets.kcal / totals.kcal;
    const outOfTolerance = Math.abs(ratio - 1) > TOLERANCE;
    if (!outOfTolerance) return { ...day, meals };

    const rescaledMeals = meals.map((meal) => ({
      ...meal,
      items: meal.items.map((item) => ({
        ...item,
        quantityG: Math.round(item.quantityG * ratio),
        kcal: Math.round(item.kcal * ratio),
        proteinG: Math.round(item.proteinG * ratio),
        carbG: Math.round(item.carbG * ratio),
        fatG: Math.round(item.fatG * ratio),
      })),
    }));

    return { ...day, meals: rescaledMeals };
  });

  return { days };
}
