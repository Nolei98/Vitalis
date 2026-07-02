import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import AgendaView from '@/components/AgendaView';
import SyncButton from '@/components/SyncButton';
import { addDays } from 'date-fns';
import { dayRangeInTimezone } from '@/lib/timezone';
import PageFrame from '@/components/PageFrame';
import ModIcon from '@/components/ModIcon';

export const dynamic = 'force-dynamic';

export default async function AgendaPage() {
  const user = await getCurrentUser();
  const { start: from } = dayRangeInTimezone(user.timezone);
  const to = addDays(from, 7);

  // 1. Busca eventos de calendário (Google, Canvas)
  const events = await prisma.calendarEvent.findMany({
    where: { userId: user.id, start: { gte: from, lt: to } },
    orderBy: { start: 'asc' },
  });

  const serializedEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start.toISOString(),
    end: e.end.toISOString(),
    allDay: e.allDay,
    source: e.source,
    location: e.location,
    url: e.url,
  }));

  // 2. Busca tarefas com data de entrega nos próximos 7 dias
  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      due: { gte: from, lt: to },
    },
    orderBy: { due: 'asc' },
  });

  const serializedTasks = tasks.map((t) => ({
    id: t.id,
    title: `📝 ${t.project ? `[${t.project}] ` : ''}${t.title}`,
    start: t.due!.toISOString(),
    end: t.due!.toISOString(),
    allDay: false,
    source: t.source || 'tasks',
    location: null,
    url: null,
    isCompleted: t.status === 'completed',
  }));

  // 3. Combina ambos
  const combined = [...serializedEvents, ...serializedTasks];

  return (
    <PageFrame>
      <header className="flex-shrink-0 flex justify-between items-center pt-2">
        <div className="flex items-center gap-3">
          <ModIcon mod="agenda" size="lg" />
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>
              Vitalis Agenda
            </h1>
            <p className="text-sm font-bold" style={{ color: 'var(--mod-agenda)' }}>Google · Canvas · ClickUp — próximos 7 dias</p>
          </div>
        </div>
        <SyncButton />
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <AgendaView events={combined} />
      </div>
    </PageFrame>
  );
}
