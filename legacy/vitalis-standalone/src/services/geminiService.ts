import { GoogleGenAI, Type } from '@google/genai';
import { MacroTargets, UserProfile } from '../types';
import { GOAL_LABELS } from '../utils/nutrition';

// Modelo Gemini estável e rápido. Caso a chave/modelo falhe, as funções retornam null
// e a UI trata graciosamente (sem quebrar o app).
const MODEL = 'gemini-2.5-flash';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface MealAnalysis {
  name: string;
  energyKcal: number;
  fatG: number;
  carbsG: number;
  proteinG: number;
  advice: string;
}

export const analyzeMeal = async (mealDescription: string): Promise<MealAnalysis | null> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Analise nutricionalmente a seguinte refeição (porção descrita) e retorne estimativas totais em JSON, valores numéricos em gramas e kcal: "${mealDescription}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Nome curto da refeição' },
            energyKcal: { type: Type.NUMBER },
            fatG: { type: Type.NUMBER },
            carbsG: { type: Type.NUMBER },
            proteinG: { type: Type.NUMBER },
            advice: { type: Type.STRING, description: 'Breve conselho nutricional sobre esta refeição' },
          },
          required: ['name', 'energyKcal', 'fatG', 'carbsG', 'proteinG', 'advice'],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as MealAnalysis;
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    return null;
  }
};

/** Dica curta e personalizada conforme objetivo e progresso do dia. */
export const getCoachingTips = async (
  profile: UserProfile,
  todayTotals: { kcal: number; protein: number; carbs: number; fat: number }
): Promise<string | null> => {
  try {
    const ai = getClient();
    const targets: MacroTargets = profile.targets || { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    const goalLabel = profile.goal ? GOAL_LABELS[profile.goal] : 'manutenção';
    const prompt = `Você é um nutricionista. Objetivo do usuário: ${goalLabel}.
Metas diárias: ${targets.kcal} kcal, ${targets.protein}g proteína, ${targets.carbs}g carbo, ${targets.fat}g gordura.
Consumido hoje: ${todayTotals.kcal} kcal, ${todayTotals.protein}g proteína, ${todayTotals.carbs}g carbo, ${todayTotals.fat}g gordura.
Dê UMA dica curta (máx 2 frases), prática e motivadora em português, sobre o que ajustar no restante do dia.`;

    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    return response.text || null;
  } catch (error) {
    console.error('Gemini Coaching Error:', error);
    return null;
  }
};
