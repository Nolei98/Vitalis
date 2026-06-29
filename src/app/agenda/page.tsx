import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import AgendaView from '@/components/AgendaView';
import SyncButton from '@/components/SyncButton';
import { startOfDay, addDays } from 'date-fns';

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-[#4a3f72]">Vitalis <span className="text-[#9871F5]">Agenda</span></h1>
          <p className="text-gray-500 font-bold">Google · Canvas · ClickUp — próximos 7 dias</p>
        </div>
        <SyncButton />
      </header>
      <AgendaView events={serialized} />
    </div>
  );
}
