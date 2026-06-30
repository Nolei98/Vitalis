import 'server-only';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { notifyDiscord, COLORS, type DiscordEmbed } from '@/lib/integrations/connectors/discord';
import { startOfDay, endOfDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const WATER_GOAL = 2000;

/** "HH:mm" → minutos do dia. */
function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Verifica se `nowMin` está dentro de "HH:mm-HH:mm" (janela de envio). */
function inWindow(window: string | null, nowMin: number): boolean {
  if (!window) return true;
  const m = /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/.exec(window.trim());
  if (!m) return true;
  const a = toMinutes(m[1]);
  const b = toMinutes(m[2]);
  if (a == null || b == null) return true;
  return a <= b ? nowMin >= a && nowMin <= b : nowMin >= a || nowMin <= b; // janela que cruza meia-noite
}

function recurrenceMatchesToday(recurrence: string | null, weekday: number): boolean {
  // weekday: 1=seg ... 7=dom (date-fns 'i')
  switch (recurrence) {
    case 'weekdays':
      return weekday >= 1 && weekday <= 5;
    case 'once':
    case 'daily':
    case null:
    default:
      return true;
  }
}

export interface NotifyResult {
  ranAt: string;
  rulesFired: string[];
  alarmsFired: string[];
  messagesSent: number;
}

/**
 * Avalia NotificationRules (com janela) e Alarmes (por horário) e dispara no
 * Discord. Substitui o digest fixo. Idempotente no dia para alarmes via lastFiredAt.
 */
export async function runNotifications(userId?: string): Promise<NotifyResult> {
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : await getCurrentUser();
  if (!user) return { ranAt: new Date().toISOString(), rulesFired: [], alarmsFired: [], messagesSent: 0 };

  const tz = user.timezone || 'America/Sao_Paulo';
  const now = new Date();
  const hhmm = formatInTimeZone(now, tz, 'HH:mm');
  const nowMin = toMinutes(hhmm)!;
  const weekday = Number(formatInTimeZone(now, tz, 'i'));
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const embeds: DiscordEmbed[] = [];
  const rulesFired: string[] = [];
  const alarmsFired: string[] = [];

  const rules = await prisma.notificationRule.findMany({
    where: { userId: user.id, enabled: true, channel: 'discord' },
  });

  for (const rule of rules) {
    if (!inWindow(rule.window, nowMin)) continue;
    const embed = await buildRuleEmbed(rule.event, user.id, { dayStart, dayEnd, now, userName: user.name });
    if (embed) {
      embeds.push(embed);
      rulesFired.push(rule.event);
    }
  }

  // Alarmes: dispara os que já passaram do horário hoje e ainda não foram disparados.
  const alarms = await prisma.alarm.findMany({ where: { userId: user.id } });
  for (const a of alarms) {
    if (!a.channels.split(',').includes('discord')) continue;
    if (!recurrenceMatchesToday(a.recurrence, weekday)) continue;
    const aMin = toMinutes(a.time);
    if (aMin == null || nowMin < aMin) continue; // ainda não chegou a hora
    const firedToday =
      a.lastFiredAt != null &&
      formatInTimeZone(a.lastFiredAt, tz, 'yyyy-MM-dd') === formatInTimeZone(now, tz, 'yyyy-MM-dd');
    if (firedToday) continue;

    embeds.push({
      title: `⏰ ${a.label}`,
      description: `Lembrete das ${a.time}.`,
      color: COLORS.amber,
    });
    alarmsFired.push(a.label);
    await prisma.alarm.update({ where: { id: a.id }, data: { lastFiredAt: now } });
  }

  let messagesSent = 0;
  if (embeds.length) {
    // Discord limita a 10 embeds por mensagem.
    for (let i = 0; i < embeds.length; i += 10) {
      const sent = await notifyDiscord({ embeds: embeds.slice(i, i + 10), content: undefined }, user.id);
      if (sent) messagesSent++;
    }
  }

  return { ranAt: now.toISOString(), rulesFired, alarmsFired, messagesSent };
}

async function buildRuleEmbed(
  event: string,
  userId: string,
  ctx: { dayStart: Date; dayEnd: Date; now: Date; userName: string | null },
): Promise<DiscordEmbed | null> {
  const fmt = (d: Date) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  switch (event) {
    case 'daily_digest': {
      const [events, tasks, waterLogs] = await Promise.all([
        prisma.calendarEvent.findMany({
          where: { userId, start: { gte: ctx.dayStart, lte: ctx.dayEnd } },
          orderBy: { start: 'asc' },
          take: 10,
        }),
        prisma.task.findMany({ where: { userId, status: 'pending' }, orderBy: { priority: 'desc' }, take: 3 }),
        prisma.waterLog.findMany({ where: { userId, createdAt: { gte: ctx.dayStart, lte: ctx.dayEnd } } }),
      ]);
      const water = waterLogs.reduce((a, w) => a + w.amount, 0);
      return {
        title: `☀️ Resumo do dia — ${ctx.userName ?? 'LifeOS'}`,
        color: COLORS.purple,
        fields: [
          {
            name: '📅 Agenda',
            value: events.length
              ? events.map((e) => `• ${e.allDay ? 'dia todo' : fmt(e.start)} — ${e.title}`).join('\n')
              : 'Nada agendado.',
          },
          { name: '✅ Top tarefas', value: tasks.length ? tasks.map((t) => `• ${t.title}`).join('\n') : 'Sem pendências 🎉' },
          { name: '💧 Hidratação', value: `${water}/${WATER_GOAL}ml (${Math.round((water / WATER_GOAL) * 100)}%)` },
        ],
      };
    }
    case 'task_due': {
      const due = await prisma.task.findMany({
        where: { userId, status: 'pending', due: { gte: ctx.dayStart, lte: ctx.dayEnd } },
        orderBy: { priority: 'desc' },
      });
      if (!due.length) return null;
      return {
        title: '✅ Tarefas vencendo hoje',
        color: COLORS.pink,
        description: due.map((t) => `• ${t.title}`).join('\n'),
      };
    }
    case 'water_reminder': {
      const logs = await prisma.waterLog.findMany({ where: { userId, createdAt: { gte: ctx.dayStart, lte: ctx.dayEnd } } });
      const water = logs.reduce((a, w) => a + w.amount, 0);
      if (water >= WATER_GOAL) return null;
      return {
        title: '💧 Hora de beber água',
        color: COLORS.blue,
        description: `Você está em ${water}/${WATER_GOAL}ml. Faltam ${WATER_GOAL - water}ml.`,
      };
    }
    case 'event_soon': {
      const soon = new Date(ctx.now.getTime() + 60 * 60 * 1000);
      const events = await prisma.calendarEvent.findMany({
        where: { userId, allDay: false, start: { gte: ctx.now, lte: soon } },
        orderBy: { start: 'asc' },
      });
      if (!events.length) return null;
      return {
        title: '📅 Eventos na próxima hora',
        color: COLORS.purple,
        description: events.map((e) => `• ${fmt(e.start)} — ${e.title}`).join('\n'),
      };
    }
    case 'budget_over': {
      const [budgets, monthTx] = await Promise.all([
        prisma.budget.findMany({ where: { userId } }),
        prisma.transaction.findMany({
          where: { userId, kind: 'expense', date: { gte: new Date(ctx.now.getFullYear(), ctx.now.getMonth(), 1) } },
        }),
      ]);
      const spent = new Map<string, number>();
      for (const t of monthTx) {
        const k = (t.category || 'Outros').toLowerCase();
        spent.set(k, (spent.get(k) ?? 0) + t.amount);
      }
      const over = budgets.filter((b) => (spent.get(b.category.toLowerCase()) ?? 0) > b.limit);
      if (!over.length) return null;
      return {
        title: '💰 Orçamentos estourados',
        color: COLORS.pink,
        description: over
          .map((b) => `• ${b.category}: R$ ${(spent.get(b.category.toLowerCase()) ?? 0).toFixed(0)} / ${b.limit.toFixed(0)}`)
          .join('\n'),
      };
    }
    default:
      return null;
  }
}
