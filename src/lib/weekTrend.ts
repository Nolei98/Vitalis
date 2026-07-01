import 'server-only';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { dayRangeInTimezone, daysAgoInTimezone } from '@/lib/timezone';

export interface WeekPoint {
  label: string;
  value: number;
}

/** Kcal consumidas por dia nos últimos N dias (incl. hoje), na timezone do usuário. */
export async function kcalTrend(userId: string, tz: string, days = 7): Promise<WeekPoint[]> {
  const result: WeekPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const ref = daysAgoInTimezone(tz, i);
    const { start, end } = dayRangeInTimezone(tz, ref);
    const meals = await prisma.meal.findMany({ where: { userId, createdAt: { gte: start, lte: end } } });
    result.push({
      label: format(start, 'EEE', { locale: ptBR }),
      value: Math.round(meals.reduce((a, m) => a + (m.calories ?? 0), 0)),
    });
  }
  return result;
}

/** Água (ml) por dia nos últimos N dias, na timezone do usuário. */
export async function waterTrend(userId: string, tz: string, days = 7): Promise<WeekPoint[]> {
  const result: WeekPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const ref = daysAgoInTimezone(tz, i);
    const { start, end } = dayRangeInTimezone(tz, ref);
    const logs = await prisma.waterLog.findMany({ where: { userId, createdAt: { gte: start, lte: end } } });
    result.push({
      label: format(start, 'EEE', { locale: ptBR }),
      value: logs.reduce((a, l) => a + l.amount, 0),
    });
  }
  return result;
}

/** Tarefas concluídas por dia nos últimos N dias, na timezone do usuário. */
export async function taskTrend(userId: string, tz: string, days = 7): Promise<WeekPoint[]> {
  const result: WeekPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const ref = daysAgoInTimezone(tz, i);
    const { start, end } = dayRangeInTimezone(tz, ref);
    const count = await prisma.task.count({
      where: { userId, status: 'completed', completedAt: { gte: start, lte: end } },
    });
    result.push({ label: format(start, 'EEE', { locale: ptBR }), value: count });
  }
  return result;
}

/** Eventos de calendário por dia nos últimos N dias, na timezone do usuário. */
export async function eventTrend(userId: string, tz: string, days = 7): Promise<WeekPoint[]> {
  const result: WeekPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const ref = daysAgoInTimezone(tz, i);
    const { start, end } = dayRangeInTimezone(tz, ref);
    const count = await prisma.calendarEvent.count({ where: { userId, start: { gte: start, lte: end } } });
    result.push({ label: format(start, 'EEE', { locale: ptBR }), value: count });
  }
  return result;
}
