import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import DietaClient from '@/components/nutrition/DietaClient';
import type { FoodItem, Goal } from '@/lib/nutrition/types';

export const dynamic = 'force-dynamic';

export default async function DietaPage() {
  const user = await getCurrentUser();

  const meals = await prisma.meal.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    orderBy: { createdAt: 'asc' },
  });

  const customRows = await prisma.food.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

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
    />
  );
}
