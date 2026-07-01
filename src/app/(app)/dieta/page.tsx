import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import DietaClient from '@/components/nutrition/DietaClient';
import SaveToSheetsButton from '@/components/nutrition/SaveToSheetsButton';
import { sheetsConfigured } from '@/lib/integrations/sheets';
import { dayRangeInTimezone } from '@/lib/timezone';
import { getDietProfile, getLatestPlan } from '@/app/actions/diet';
import type { FoodItem, Goal } from '@/lib/nutrition/types';

export const dynamic = 'force-dynamic';
// Server Actions de geração/regeneração do plano de dieta (Gemini) chamadas a
// partir desta rota ganham até 60s (teto do plano Hobby da Vercel) em vez do
// padrão de ~10s — mesmo assim a geração é feita dia a dia pra nunca chegar perto disso.
export const maxDuration = 60;

export default async function DietaPage() {
  const user = await getCurrentUser();
  const { start } = dayRangeInTimezone(user.timezone);

  const meals = await prisma.meal.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: start },
    },
    orderBy: { createdAt: 'asc' },
  });

  const customRows = await prisma.food.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const [dietProfile, dietPlan, nutritionGoals] = await Promise.all([
    getDietProfile(),
    getLatestPlan(),
    prisma.goal.findMany({ where: { userId: user.id, type: { not: 'vault' }, status: 'active' }, orderBy: { deadline: 'asc' } }),
  ]);

  const customFoods: FoodItem[] = customRows.map(f => ({
    id: f.id,
    name: f.name,
    brand: f.brand || undefined,
    category: (f.category as FoodItem['category']) || 'Outro',
    energyKcal: f.energyKcal,
    proteinG: f.proteinG,
    carbsG: f.carbsG,
    fatG: f.fatG,
    goals: (f.goals ? f.goals.split(',') : []) as Goal[],
    isCustom: true,
  }));

  const todayTotals = meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const targets =
    user.targetKcal != null
      ? {
          kcal: user.targetKcal,
          protein: user.targetProtein || 0,
          carbs: user.targetCarbs || 0,
          fat: user.targetFat || 0,
        }
      : null;

  return (
    <div className="h-full flex flex-col gap-2 page-enter">
    {sheetsConfigured() && (
      <div className="flex justify-end flex-shrink-0">
        <SaveToSheetsButton />
      </div>
    )}
    <DietaClient
      profile={{
        name: user.name,
        sex: user.sex,
        age: user.age,
        heightCm: user.heightCm,
        weightKg: user.weightKg,
        activityLevel: user.activityLevel,
        goal: user.goal,
      }}
      targets={targets}
      todayTotals={todayTotals}
      meals={meals.map(m => ({
        id: m.id, type: m.type, food: m.food, grams: m.grams,
        calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat,
      }))}
      customFoods={customFoods}
      aiEnabled={!!process.env.GEMINI_API_KEY}
      dietProfile={dietProfile}
      dietPlan={dietPlan}
      nutritionGoals={nutritionGoals.map((g) => ({ id: g.id, title: g.title, deadline: g.deadline?.toISOString() ?? null }))}
    />
    </div>
  );
}
