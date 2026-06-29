import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import AgendaView from '@/components/AgendaView';
import SyncButton from '@/components/SyncButton';
import { startOfDay, addDays } from 'date-fns';
import PageFrame from '@/components/PageFrame';

export const dynamic = 'force-dynamic';

export default async function AgendaPage() {
  const user = await getCurrentUser();
  const from = startOfDay(new Date());
  const to = addDays(from, 7);

  const events = await prisma.calendarEvent.findMany({
    where: { userId: user.id, start: { gte: from, lt: to } },
    orderBy: { start: 'asc' },
  });

  const serialized = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start.toISOString(),
    end: e.end.toISOString(),
    allDay: e.allDay,
    source: e.source,
    location: e.location,
    url: e.url,
  }));

  return (
    <PageFrame>
      <header className="flex-shrink-0 flex justify-between items-center pt-2">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'var(--mod-agenda-bg)' }}>📅</span>
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
        <AgendaView events={serialized} />
      </div>
    </PageFrame>
  );
}
