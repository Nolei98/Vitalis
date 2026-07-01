'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser, getCurrentUserId } from '@/lib/user';
import { revalidatePath } from 'next/cache';
import type { DietProfile } from '@prisma/client';
import {
  computeTargets, mealSplit,
  type DietSex, type DietGoal, type DietActivity, type DietStyle, type MacroTargets,
} from '@/lib/diet/targets';
import { generateWeek, generateOneDay, generateOneMeal, type DietPrefs } from '@/lib/diet/generate';
import { validateAndRescale } from '@/lib/diet/validate';
import { weekdayForDate } from '@/lib/diet/period';
import { buildShoppingList } from '@/lib/diet/shopping';
import { dayRangeInTimezone } from '@/lib/timezone';

function revalidateDiet() {
  revalidatePath('/dieta');
  revalidatePath('/');
  revalidatePath('/alarmes');
}

function csv(arr?: string[] | null): string | null {
  return arr && arr.length ? arr.join(',') : null;
}

function parseCsv(s?: string | null): string[] {
  return s ? s.split(',').map((x) => x.trim()).filter(Boolean) : [];
}

function profileToPrefs(profile: DietProfile): DietPrefs {
  return {
    style: profile.style,
    mealsPerDay: profile.mealsPerDay,
    restrictions: parseCsv(profile.restrictions),
    preferred: parseCsv(profile.preferred),
    disliked: parseCsv(profile.disliked),
    available: parseCsv(profile.available),
    budget: profile.budget,
  };
}

function profileTargets(profile: DietProfile): MacroTargets {
  return computeTargets({
    sex: profile.sex as DietSex,
    age: profile.age,
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    activity: profile.activity as DietActivity,
    goal: profile.goal as DietGoal,
  });
}

async function requireOwnPlan(planId: string, userId: string) {
  const plan = await prisma.dietPlan.findUnique({ where: { id: planId } });
  if (!plan || plan.userId !== userId) throw new Error('Plano não encontrado.');
  return plan;
}

// ===== Perfil =====

export interface DietProfileInput {
  goal: DietGoal;
  sex: DietSex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: DietActivity;
  style: DietStyle;
  restrictions?: string[];
  mealsPerDay?: number;
  preferred?: string[];
  disliked?: string[];
  available?: string[];
  budget?: 'economico' | 'moderado' | 'sem_restricao';
}

export async function saveDietProfile(input: DietProfileInput): Promise<DietProfile> {
  const user = await getCurrentUser();
  const targets = computeTargets(input);
  const data = {
    goal: input.goal,
    sex: input.sex,
    age: input.age,
    weightKg: input.weightKg,
    heightCm: input.heightCm,
    activity: input.activity,
    style: input.style,
    restrictions: csv(input.restrictions),
    mealsPerDay: input.mealsPerDay ?? 4,
    preferred: csv(input.preferred),
    disliked: csv(input.disliked),
    available: csv(input.available),
    budget: input.budget ?? 'moderado',
    kcalTarget: targets.kcal,
    proteinTarget: targets.proteinG,
    carbTarget: targets.carbG,
    fatTarget: targets.fatG,
  };
  const profile = await prisma.dietProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });
  revalidateDiet();
  return profile;
}

export async function getDietProfile(): Promise<DietProfile | null> {
  const userId = await getCurrentUserId();
  return prisma.dietProfile.findUnique({ where: { userId } });
}

// ===== Geração / edição do plano =====

export async function generateDietPlan(opts: { endDate?: Date; goalId?: string; name?: string }) {
  const user = await getCurrentUser();
  const profile = await prisma.dietProfile.findUnique({ where: { userId: user.id } });
  if (!profile) throw new Error('Crie seu perfil de dieta antes de gerar um plano.');

  const targets = profileTargets(profile);
  const prefs = profileToPrefs(profile);

  const raw = await generateWeek(targets, prefs);
  if (!raw?.days?.length) throw new Error('Não foi possível gerar o plano agora. Tente novamente em instantes.');

  const validated = validateAndRescale(raw, targets, prefs.restrictions);

  // Sem data de término: o plano gira em torno da meta (cut/maintain/bulk) e só muda
  // quando o usuário pede (regenerar/recalibrar) ou encerra manualmente. Se vinculado
  // a uma Goal com prazo, usa esse prazo como referência; senão fica indefinido.
  let endDate = opts.endDate ?? null;
  if (!endDate && opts.goalId) {
    const goal = await prisma.goal.findUnique({ where: { id: opts.goalId } });
    endDate = goal?.deadline ?? null;
  }

  const plan = await prisma.dietPlan.create({
    data: {
      userId: user.id,
      name: opts.name ?? `Plano ${new Date().toLocaleDateString('pt-BR')}`,
      status: 'draft',
      generatedBy: 'ai',
      goalId: opts.goalId ?? null,
      startDate: new Date(),
      endDate,
      kcalTarget: targets.kcal,
      proteinTarget: targets.proteinG,
      carbTarget: targets.carbG,
      fatTarget: targets.fatG,
      days: {
        create: validated.days.map((day) => ({
          weekday: day.weekday,
          meals: {
            create: day.meals.map((meal, idx) => ({
              type: meal.type,
              name: meal.name,
              order: idx,
              items: { create: meal.items.map((item) => ({ ...item })) },
            })),
          },
        })),
      },
    },
    include: { days: { include: { meals: { include: { items: true } } } } },
  });

  revalidateDiet();
  return plan;
}

export async function regenerateDay(planId: string, weekday: number) {
  const userId = await getCurrentUserId();
  const plan = await requireOwnPlan(planId, userId);
  const profile = await prisma.dietProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Perfil de dieta não encontrado.');

  const targets: MacroTargets = { kcal: plan.kcalTarget, proteinG: plan.proteinTarget, carbG: plan.carbTarget, fatG: plan.fatTarget };
  const prefs = profileToPrefs(profile);

  const day = await generateOneDay(weekday, targets, prefs);
  if (!day) throw new Error('Não foi possível regenerar o dia agora.');
  const validated = validateAndRescale({ days: [day] }, targets, prefs.restrictions).days[0];

  await prisma.plannedDay.deleteMany({ where: { planId, weekday } });
  const created = await prisma.plannedDay.create({
    data: {
      planId,
      weekday,
      meals: {
        create: validated.meals.map((meal, idx) => ({
          type: meal.type,
          name: meal.name,
          order: idx,
          items: { create: meal.items.map((item) => ({ ...item })) },
        })),
      },
    },
    include: { meals: { include: { items: true } } },
  });

  revalidateDiet();
  return created;
}

export async function regenerateMeal(planId: string, mealId: string) {
  const userId = await getCurrentUserId();
  const plan = await requireOwnPlan(planId, userId);
  const meal = await prisma.plannedMeal.findUnique({ where: { id: mealId }, include: { day: true } });
  if (!meal || meal.day.planId !== planId) throw new Error('Refeição não encontrada.');
  const profile = await prisma.dietProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Perfil de dieta não encontrado.');

  const prefs = profileToPrefs(profile);
  const split = mealSplit(profile.mealsPerDay);
  const slice = split.find((s) => s.type === meal.type)?.pct ?? 1 / split.length;
  const mealTargets: MacroTargets = {
    kcal: Math.round(plan.kcalTarget * slice),
    proteinG: Math.round(plan.proteinTarget * slice),
    carbG: Math.round(plan.carbTarget * slice),
    fatG: Math.round(plan.fatTarget * slice),
  };

  const generated = await generateOneMeal(meal.type, mealTargets, prefs);
  if (!generated) throw new Error('Não foi possível regenerar a refeição agora.');
  const validated = validateAndRescale(
    { days: [{ weekday: 0, meals: [generated] }] },
    mealTargets,
    prefs.restrictions,
  ).days[0].meals[0];

  await prisma.plannedItem.deleteMany({ where: { mealId } });
  const updated = await prisma.plannedMeal.update({
    where: { id: mealId },
    data: { name: validated.name, items: { create: validated.items.map((item) => ({ ...item })) } },
    include: { items: true },
  });

  revalidateDiet();
  return updated;
}

export async function swapItem(itemId: string, newFoodId: string) {
  const item = await prisma.plannedItem.findUnique({
    where: { id: itemId },
    include: { meal: { include: { day: { include: { plan: true } } } } },
  });
  if (!item) throw new Error('Item não encontrado.');
  const userId = await getCurrentUserId();
  if (item.meal.day.plan.userId !== userId) throw new Error('Sem permissão.');

  const food = await prisma.foodCatalogItem.findUnique({ where: { id: newFoodId } });
  if (!food) throw new Error('Alimento não encontrado no catálogo.');

  const ratio = item.quantityG / 100;
  const updated = await prisma.plannedItem.update({
    where: { id: itemId },
    data: {
      foodId: food.id,
      name: food.name,
      kcal: Math.round(food.per100Kcal * ratio),
      proteinG: Math.round(food.per100P * ratio),
      carbG: Math.round(food.per100C * ratio),
      fatG: Math.round(food.per100F * ratio),
    },
  });

  revalidateDiet();
  return updated;
}

export async function recalibratePlan(planId: string) {
  const userId = await getCurrentUserId();
  await requireOwnPlan(planId, userId);
  const profile = await prisma.dietProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error('Perfil de dieta não encontrado.');

  const targets = profileTargets(profile);
  const prefs = profileToPrefs(profile);

  const raw = await generateWeek(targets, prefs);
  if (!raw) throw new Error('Não foi possível recalibrar agora.');
  const validated = validateAndRescale(raw, targets, prefs.restrictions);

  await prisma.plannedDay.deleteMany({ where: { planId } });
  const updated = await prisma.dietPlan.update({
    where: { id: planId },
    data: {
      kcalTarget: targets.kcal,
      proteinTarget: targets.proteinG,
      carbTarget: targets.carbG,
      fatTarget: targets.fatG,
      days: {
        create: validated.days.map((day) => ({
          weekday: day.weekday,
          meals: {
            create: day.meals.map((meal, idx) => ({
              type: meal.type,
              name: meal.name,
              order: idx,
              items: { create: meal.items.map((item) => ({ ...item })) },
            })),
          },
        })),
      },
    },
    include: { days: { include: { meals: { include: { items: true } } } } },
  });

  await prisma.dietProfile.update({
    where: { userId },
    data: { kcalTarget: targets.kcal, proteinTarget: targets.proteinG, carbTarget: targets.carbG, fatTarget: targets.fatG },
  });

  revalidateDiet();
  return updated;
}

const DEFAULT_MEAL_TIME: Record<string, string> = {
  cafe: '07:00', lanche_manha: '10:00', almoco: '12:00', lanche: '16:00', jantar: '19:30', ceia: '21:30',
};

export async function savePlan(planId: string, createReminders = false) {
  const userId = await getCurrentUserId();
  await requireOwnPlan(planId, userId);
  await prisma.dietPlan.updateMany({ where: { userId, status: 'active' }, data: { status: 'archived' } });
  await prisma.dietPlan.update({ where: { id: planId }, data: { status: 'active' } });

  if (createReminders) {
    const day = await prisma.plannedDay.findFirst({ where: { planId, weekday: 0 }, include: { meals: true } });
    if (day) {
      await prisma.alarm.deleteMany({ where: { userId, type: 'meal', label: { startsWith: 'Plano: ' } } });
      await prisma.$transaction(
        day.meals.map((meal) =>
          prisma.alarm.create({
            data: {
              userId,
              label: `Plano: ${meal.name}`,
              time: DEFAULT_MEAL_TIME[meal.type] ?? '12:00',
              recurrence: 'daily',
              type: 'meal',
              channels: 'app',
            },
          }),
        ),
      );
    }
  }

  revalidateDiet();
}

/** Encerra o plano manualmente — o plano não expira sozinho, só quando o usuário pede. */
export async function endPlan(planId: string) {
  const userId = await getCurrentUserId();
  await requireOwnPlan(planId, userId);
  await prisma.dietPlan.update({ where: { id: planId }, data: { status: 'archived' } });
  await prisma.alarm.deleteMany({ where: { userId, type: 'meal', label: { startsWith: 'Plano: ' } } });
  revalidateDiet();
}

// ===== Período / aplicação ao registro real =====

export async function resolveDay(planId: string, date: Date) {
  const userId = await getCurrentUserId();
  const plan = await requireOwnPlan(planId, userId);
  const weekday = weekdayForDate(plan.startDate, date);
  return prisma.plannedDay.findUnique({
    where: { planId_weekday: { planId, weekday } },
    include: { meals: { include: { items: true }, orderBy: { order: 'asc' } } },
  });
}

export async function applyPlanToDay(planId: string, date: Date) {
  const userId = await getCurrentUserId();
  const day = await resolveDay(planId, date);
  if (!day) throw new Error('Sem dia planejado pra essa data.');

  const created = await prisma.$transaction(
    day.meals.flatMap((meal) =>
      meal.items.map((item) =>
        prisma.meal.create({
          data: {
            userId,
            type: meal.type,
            food: item.name,
            grams: Math.round(item.quantityG),
            calories: item.kcal,
            protein: item.proteinG,
            carbs: item.carbG,
            fat: item.fatG,
            createdAt: date,
          },
        }),
      ),
    ),
  );

  revalidateDiet();
  return created;
}

export async function getActivePlan() {
  const userId = await getCurrentUserId();
  return prisma.dietPlan.findFirst({
    where: { userId, status: 'active' },
    include: { days: { include: { meals: { include: { items: true }, orderBy: { order: 'asc' } } }, orderBy: { weekday: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
}

/** Plano mais recente ainda não arquivado (draft pra revisar ou active) — usado pela tela. */
export async function getLatestPlan() {
  const userId = await getCurrentUserId();
  return prisma.dietPlan.findFirst({
    where: { userId, status: { in: ['draft', 'active'] } },
    include: { days: { include: { meals: { include: { items: true }, orderBy: { order: 'asc' } } }, orderBy: { weekday: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTodayPlannedDay() {
  const user = await getCurrentUser();
  const plan = await prisma.dietPlan.findFirst({ where: { userId: user.id, status: 'active' } });
  if (!plan) return null;
  const { start } = dayRangeInTimezone(user.timezone);
  return resolveDay(plan.id, start);
}

// ===== Lista de compras =====

export async function generateShoppingList(planId: string, range: 'day' | 'week') {
  const userId = await getCurrentUserId();
  await requireOwnPlan(planId, userId);

  if (range === 'day') {
    const day = await resolveDay(planId, new Date());
    const items = day?.meals.flatMap((m) => m.items.map((i) => ({ name: i.name, quantityG: i.quantityG }))) ?? [];
    return buildShoppingList(items);
  }

  const days = await prisma.plannedDay.findMany({ where: { planId }, include: { meals: { include: { items: true } } } });
  const items = days.flatMap((d) => d.meals.flatMap((m) => m.items.map((i) => ({ name: i.name, quantityG: i.quantityG }))));
  return buildShoppingList(items);
}

// ===== Catálogo de alimentos (troca de item) =====

export async function searchFoodCatalog(query: string) {
  if (!query.trim()) return [];
  return prisma.foodCatalogItem.findMany({
    where: { name: { contains: query.trim(), mode: 'insensitive' } },
    take: 15,
    orderBy: { name: 'asc' },
  });
}
