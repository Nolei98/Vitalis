import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  format,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface CalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  source: string;
  category?: string | null;
  location?: string | null;
  url?: string | null;
}

export function todayRange() {
  const now = new Date();
  return { start: startOfDay(now), end: endOfDay(now) };
}

export function weekRange(base = new Date()) {
  return {
    start: startOfWeek(base, { weekStartsOn: 0 }),
    end: endOfWeek(base, { weekStartsOn: 0 }),
  };
}

/** Agrupa eventos por dia (7 dias a partir de `from`). */
export function groupByDay(events: CalEvent[], from: Date, days = 7) {
  const buckets: { date: Date; events: CalEvent[] }[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(startOfDay(from), i);
    buckets.push({
      date,
      events: events
        .filter((e) => isSameDay(e.start, date))
        .sort((a, b) => a.start.getTime() - b.start.getTime()),
    });
  }
  return buckets;
}

export const fmtTime = (d: Date) => format(d, 'HH:mm', { locale: ptBR });
export const fmtDay = (d: Date) => format(d, "EEE, dd 'de' MMM", { locale: ptBR });
export const fmtDayShort = (d: Date) => format(d, 'EEE dd', { locale: ptBR });

/** Cor (classe Tailwind) por fonte do evento — paleta Claymorphism. */
export function sourceColor(source: string): { bg: string; text: string; dot: string } {
  switch (source) {
    case 'google':
      return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' };
    case 'canvas':
      return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' };
    case 'clickup':
      return { bg: 'bg-pink-50', text: 'text-pink-700', dot: 'bg-pink-400' };
    default:
      return { bg: 'bg-purple-50', text: 'text-[#9871F5]', dot: 'bg-[#9871F5]' };
  }
}
