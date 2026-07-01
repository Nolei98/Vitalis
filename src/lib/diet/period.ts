/**
 * Resolve o weekday (0=seg...6=dom) do dia-molde que corresponde a uma data real,
 * dado o início do plano. A semana-molde de 7 dias é rotacionada até endDate —
 * um plano de 12 semanas ocupa o mesmo espaço em banco que 1 semana só.
 */
export function weekdayForDate(startDate: Date, date: Date): number {
  const msPerDay = 86_400_000;
  const startDay = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const targetDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((targetDay - startDay) / msPerDay);
  const startWeekdayIso = (startDate.getDay() + 6) % 7; // getDay(): 0=dom → converte pra 0=seg
  const weekday = ((startWeekdayIso + diffDays) % 7 + 7) % 7;
  return weekday;
}

export function isDateWithinPlan(startDate: Date, endDate: Date | null, date: Date): boolean {
  if (date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}
