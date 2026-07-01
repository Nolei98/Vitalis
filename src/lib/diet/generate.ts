import 'server-only';
import type { MacroTargets } from './targets';
import type { RawWeekPlan, RawDay, RawMeal } from './validate';

export interface DietPrefs {
  style: string;
  mealsPerDay: number;
  restrictions: string[];
  preferred: string[];
  disliked: string[];
  available: string[];
  budget: string;
}

const BUDGET_RULE: Record<string, string> = {
  economico: 'Priorize fortemente alimentos baratos e acessíveis no Brasil (arroz, feijão, ovos, frango, banana, batata, aveia...). Evite itens caros (salmão, castanhas nobres, queijos especiais, carnes premium) a menos que estejam em prefs.preferred/available.',
  moderado: 'Equilibre custo e variedade: use alimentos baratos como base e inclua itens um pouco mais caros com moderação.',
  sem_restricao: 'Não precisa se preocupar com custo — priorize variedade e qualidade nutricional.',
};

const BASE_RULES = `- kcal-alvo e macros (proteína/carbo/gordura) de \`targets\` (tolerância ±10%).
- Estilo alimentar prefs.style e EXCLUSÃO TOTAL de prefs.restrictions/allergies.
- prefs.preferred são alimentos que o usuário PEDIU EXPLICITAMENTE pra incluir — use-os generosamente.
- Para o que faltar além do que o usuário pediu, preencha considerando o custo: {{BUDGET}}
- Priorize também prefs.available (o que já tem em casa); evite prefs.disliked.
- Use alimentos comuns no Brasil, porções realistas em gramas.
- Preencha kcal e macros de cada item com valores nutricionais plausíveis.
- NÃO escreva texto fora do JSON. NÃO dê conselho médico.`;

function withBudget(rules: string, budget: string): string {
  return rules.replace('{{BUDGET}}', BUDGET_RULE[budget] ?? BUDGET_RULE.moderado);
}

function systemWeek(budget: string): string {
  return `Você é um planejador de dieta. Monte uma SEMANA COMPLETA (7 dias) respeitando EXATAMENTE:
${withBudget(BASE_RULES, budget)}
- Varie os alimentos entre os dias (não repita o mesmo cardápio todos os dias).
- Nº de refeições = prefs.mealsPerDay, com os tipos indicados.
- weekday vai de 0 (segunda) a 6 (domingo), um objeto por dia, sem pular nenhum.`;
}

function systemDay(budget: string): string {
  return `Você é um planejador de dieta. Monte 1 DIA respeitando EXATAMENTE:
${withBudget(BASE_RULES, budget)}
- Nº de refeições = prefs.mealsPerDay, com os tipos indicados.`;
}

function systemMeal(budget: string): string {
  return `Você é um planejador de dieta. Monte 1 REFEIÇÃO respeitando EXATAMENTE:
${withBudget(BASE_RULES, budget)}
- A refeição deve somar aproximadamente o kcal/macros de \`targets\` (que já é a fatia daquela refeição, não o dia inteiro).`;
}

const itemSchemaProps = (Type: typeof import('@google/genai').Type) => ({
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    quantityG: { type: Type.NUMBER },
    kcal: { type: Type.NUMBER },
    proteinG: { type: Type.NUMBER },
    carbG: { type: Type.NUMBER },
    fatG: { type: Type.NUMBER },
  },
  required: ['name', 'quantityG', 'kcal', 'proteinG', 'carbG', 'fatG'],
});

const MEAL_TYPE_ENUM = ['cafe', 'lanche_manha', 'almoco', 'lanche', 'jantar', 'ceia'];

function mealSchema(Type: typeof import('@google/genai').Type) {
  return {
    type: Type.OBJECT,
    properties: {
      // enum força a IA a devolver exatamente uma dessas chaves (não texto livre tipo
      // "Café da Manhã") — sem isso, o lookup de horário de lembrete e o split de
      // macros por tipo de refeição quebram silenciosamente.
      type: { type: Type.STRING, enum: MEAL_TYPE_ENUM },
      name: { type: Type.STRING },
      items: { type: Type.ARRAY, items: itemSchemaProps(Type) },
    },
    required: ['type', 'name', 'items'],
  };
}

function daySchema(Type: typeof import('@google/genai').Type) {
  return {
    type: Type.OBJECT,
    properties: {
      weekday: { type: Type.NUMBER },
      meals: { type: Type.ARRAY, items: mealSchema(Type) },
    },
    required: ['weekday', 'meals'],
  };
}

async function callGemini<T>(system: string, contents: unknown, schema: object): Promise<T | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: JSON.stringify(contents),
      config: { systemInstruction: system, responseMimeType: 'application/json', responseSchema: schema },
    });
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch (err) {
    console.error('Gemini diet generation error:', err);
    return null;
  }
}

/** Gera a semana-molde (7 dias) inteira numa única chamada. */
export async function generateWeek(targets: MacroTargets, prefs: DietPrefs): Promise<RawWeekPlan | null> {
  const { Type } = await import('@google/genai');
  const schema = { type: Type.OBJECT, properties: { days: { type: Type.ARRAY, items: daySchema(Type) } }, required: ['days'] };
  return callGemini<RawWeekPlan>(systemWeek(prefs.budget), { targets, prefs, days: 7 }, schema);
}

/** Regenera só 1 dia-molde — usado por "Regenerar dia". */
export async function generateOneDay(weekday: number, targets: MacroTargets, prefs: DietPrefs): Promise<RawDay | null> {
  const { Type } = await import('@google/genai');
  const result = await callGemini<RawDay>(systemDay(prefs.budget), { targets, prefs, weekday }, daySchema(Type));
  return result ? { ...result, weekday } : null;
}

/** Regenera só 1 refeição — usado por "Regenerar refeição". `targets` já é a fatia daquela refeição. */
export async function generateOneMeal(mealType: string, targets: MacroTargets, prefs: DietPrefs): Promise<RawMeal | null> {
  const { Type } = await import('@google/genai');
  return callGemini<RawMeal>(systemMeal(prefs.budget), { targets, prefs, mealType }, mealSchema(Type));
}
