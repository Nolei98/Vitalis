import 'server-only';
import { prisma } from '@/lib/prisma';
import { startOfDay, subDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface WeekPoint {
  label: string;
  value: number;
}

/** Kcal consumidas por dia nos últimos N dias (incl. hoje). */
export async function kcalTrend(userId: string, days = 7): Promise<WeekPoint[]> {
  const result: WeekPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(subDays(new Date(), i));
    const next = startOfDay(subDays(new Date(), i - 1));
    const meals = await prisma.meal.findMany({ where: { userId, createdAt: { gte: day, lt: next } } });
    result.push({
      label: format(day, 'EEE', { locale: ptBR }),
      value: Math.round(meals.reduce((a, m) => a + (m.calories ?? 0), 0)),
    });
  }
  return result;
}

/** Água (ml) por dia nos últimos N dias. */
export async function waterTrend(userId: string, days = 7): Promise<WeekPoint[]> {
  const result: WeekPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(subDays(new Date(), i));
    const next = startOfDay(subDays(new Date(), i - 1));
    const logs = await prisma.waterLog.findMany({ where: { userId, createdAt: { gte: day, lt: next } } });
    result.push({
      label: format(day, 'EEE', { locale: ptBR }),
      value: logs.reduce((a, l) => a + l.amount, 0),
    });
  }
  return result;
}

/** Tarefas concluídas por dia nos últimos N dias. */
export async function taskTrend(userId: string, days = 7): Promise<WeekPoint[]> {
  const result: WeekPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(subDays(new Date(), i));
    const next = startOfDay(subDays(new Date(), i - 1));
    const count = await prisma.task.count({ where: { userId, status: 'done' } });
    result.push({ label: format(day, 'EEE', { locale: ptBR }), value: count });
  }
  return result;
}

/** Eventos de calendário por dia nos últimos N dias. */
export async function eventTrend(userId: string, days = 7): Promise<WeekPoint[]> {
  const result: WeekPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = startOfDay(subDays(new Date(), i));
    const next = startOfDay(subDays(new Date(), i - 1));
    const count = await prisma.calendarEvent.count({ where: { userId, start: { gte: day, lt: next } } });
    result.push({ label: format(day, 'EEE', { locale: ptBR }), value: count });
  }
  return result;
}
