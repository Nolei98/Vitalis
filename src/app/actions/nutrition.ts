'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/user';
import { revalidatePath } from 'next/cache';
import { computeTargets, kcalFromMacros } from '@/lib/nutrition/calc';
import type { NutritionProfile } from '@/lib/nutrition/types';

function revalidateNutrition() {
  revalidatePath('/dieta');
  revalidatePath('/');
}

// ===== Perfil físico + metas =====

export async function saveNutritionProfile(formData: FormData) {
  const userId = await getCurrentUserId();
  const num = (k: string) => {
    const v = parseFloat(String(formData.get(k) ?? ''));
    return Number.isFinite(v) ? v : null;
  };

  const profile: NutritionProfile = {
    sex: (formData.get('sex') as string) || null,
    age: num('age'),
    heightCm: num('heightCm'),
    weightKg: num('weightKg'),
    activityLevel: (formData.get('activityLevel') as string) || null,
    goal: (formData.get('goal') as string) || null,
  };

  const targets = computeTargets(profile);

  await prisma.user.update({
    where: { id: userId },
    data: {
      sex: profile.sex ?? undefined,
      age: profile.age ?? undefined,
      heightCm: profile.heightCm != null ? Math.round(profile.heightCm) : undefined,
      weightKg: profile.weightKg ?? undefined,
      activityLevel: profile.activityLevel ?? undefined,
      goal: profile.goal ?? undefined,
      targetKcal: targets?.kcal ?? undefined,
      targetProtein: targets?.protein ?? undefined,
      targetCarbs: targets?.carbs ?? undefined,
      targetFat: targets?.fat ?? undefined,
    },
  });
  revalidateNutrition();
}

export async function saveTargetsManual(formData: FormData) {
  const userId = await getCurrentUserId();
  const int = (k: string) => {
    const v = parseInt(String(formData.get(k) ?? ''), 10);
    return Number.isFinite(v) ? v : null;
  };
  await prisma.user.update({
    where: { id: userId },
    data: {
      targetKcal: int('kcal') ?? undefined,
      targetProtein: int('protein') ?? undefined,
      targetCarbs: int('carbs') ?? undefined,
      targetFat: int('fat') ?? undefined,
    },
  });
  revalidateNutrition();
}

// ===== Refeições (multi-itens) =====

export interface MealItemInput {
  type: string;
  food: string;
  grams?: number;
  foodId?: string;
  protein: number;
  carbs: number;
  fat: number;
  calories?: number;
}

export async function addMealItems(items: MealItemInput[]) {
  if (!items?.length) return;
  const userId = await getCurrentUserId();
  await prisma.meal.createMany({
    data: items.map(i => ({
      userId,
      type: i.type || 'Refeição',
      food: i.food,
      grams: i.grams != null ? Math.round(i.grams) : null,
      foodId: i.foodId || null,
      protein: Math.round(i.protein || 0),
      carbs: Math.round(i.carbs || 0),
      fat: Math.round(i.fat || 0),
      calories: Math.round(i.calories ?? kcalFromMacros(i.protein || 0, i.carbs || 0, i.fat || 0)),
    })),
  });
  revalidateNutrition();
}

// ===== Biblioteca de alimentos (custom) =====

function macrosFromForm(formData: FormData) {
  const f = (k: string) => Math.max(0, parseFloat(String(formData.get(k) ?? '')) || 0);
  const proteinG = f('proteinG');
  const carbsG = f('carbsG');
  const fatG = f('fatG');
  return { proteinG, carbsG, fatG, energyKcal: kcalFromMacros(proteinG, carbsG, fatG) };
}

export async function addFood(formData: FormData) {
  const userId = await getCurrentUserId();
  const name = String(formData.get('name') || '').trim();
  if (!name) return;
  const { proteinG, carbsG, fatG, energyKcal } = macrosFromForm(formData);
  await prisma.food.create({
    data: {
      userId,
      name,
      brand: (String(formData.get('brand') || '').trim()) || 'Personalizado',
      category: (formData.get('category') as string) || 'Outro',
      goals: (formData.getAll('goals') as string[]).join(',') || null,
      proteinG,
      carbsG,
      fatG,
      energyKcal,
    },
  });
  revalidateNutrition();
}

export async function updateFood(formData: FormData) {
  const userId = await getCurrentUserId();
  const id = String(formData.get('id') || '');
  if (!id) return;
  const { proteinG, carbsG, fatG, energyKcal } = macrosFromForm(formData);
  await prisma.food.updateMany({
    where: { id, userId },
    data: {
      name: String(formData.get('name') || '').trim(),
      brand: (String(formData.get('brand') || '').trim()) || 'Personalizado',
      category: (formData.get('category') as string) || 'Outro',
      goals: (formData.getAll('goals') as string[]).join(',') || null,
      proteinG,
      carbsG,
      fatG,
      energyKcal,
    },
  });
  revalidateNutrition();
}

export async function deleteFood(id: string) {
  const userId = await getCurrentUserId();
  await prisma.food.deleteMany({ where: { id, userId } });
  revalidateNutrition();
}

// ===== IA (Gemini) — server-side; a chave nunca vai ao cliente =====

export interface MealAnalysis {
  name: string;
  energyKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  advice: string;
}

export async function analyzeMealAI(description: string): Promise<MealAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !description?.trim()) return null;
  try {
    const { GoogleGenAI, Type } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analise nutricionalmente a refeição (porção descrita) e retorne estimativas totais em JSON, valores numéricos em gramas e kcal: "${description.trim()}"`,
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
            advice: { type: Type.STRING, description: 'Breve conselho nutricional' },
          },
          required: ['name', 'energyKcal', 'fatG', 'carbsG', 'proteinG', 'advice'],
        },
      },
    });
    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as MealAnalysis;
  } catch (err) {
    console.error('Gemini error:', err);
    return null;
  }
}
