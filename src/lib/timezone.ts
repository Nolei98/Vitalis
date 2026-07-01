import 'server-only';
import { startOfDay, endOfDay, startOfWeek, startOfMonth, subDays } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

/**
 * Início/fim do dia local do usuário, convertidos para instantes UTC reais.
 * Sem isso, "hoje" é calculado na timezone do servidor (UTC em produção), o
 * que faz contadores diários (água, refeições, etc.) resetarem 3h adiantados
 * pra quem está em America/Sao_Paulo.
 */
export function dayRangeInTimezone(tz: string, ref: Date = new Date()): { start: Date; end: Date } {
  const zoned = toZonedTime(ref, tz);
  return {
    start: fromZonedTime(startOfDay(zoned), tz),
    end: fromZonedTime(endOfDay(zoned), tz),
  };
}

/** N dias atrás (00:00 local) até agora, na timezone do usuário. */
export function daysAgoInTimezone(tz: string, days: number, ref: Date = new Date()): Date {
  const zoned = toZonedTime(ref, tz);
  return fromZonedTime(startOfDay(subDays(zoned, days)), tz);
}

/** Início da semana (segunda) ou do mês, na timezone do usuário. */
export function startOfWeekInTimezone(tz: string, ref: Date = new Date()): Date {
  return fromZonedTime(startOfWeek(toZonedTime(ref, tz), { weekStartsOn: 1 }), tz);
}

export function startOfMonthInTimezone(tz: string, ref: Date = new Date()): Date {
  return fromZonedTime(startOfMonth(toZonedTime(ref, tz)), tz);
}
