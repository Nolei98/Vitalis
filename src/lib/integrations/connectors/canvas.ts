import 'server-only';
import ical from 'node-ical';
import { prisma } from '@/lib/prisma';
import { getDecrypted, markSync } from '@/lib/integrations/vault';

export interface SyncResult {
  provider: string;
  ok: boolean;
  count: number;
  error?: string;
}

/**
 * Lê o feed .ics do Canvas e faz upsert em CalendarEvent (source=canvas).
 * Dedupe por (integrationId, externalId=uid do evento).
 */
export async function syncCanvas(userId: string): Promise<SyncResult> {
  const integ = await getDecrypted('canvas', userId);
  if (!integ?.icalUrl) return { provider: 'canvas', ok: false, count: 0, error: 'sem icalUrl' };

  try {
    const data = await ical.async.fromURL(integ.icalUrl);
    const events = Object.values(data).filter(
      (e): e is ical.VEvent => (e as ical.VEvent).type === 'VEVENT',
    );

    let count = 0;
    for (const ev of events) {
      if (!ev.start) continue;
      const externalId = String(ev.uid ?? `${ev.summary}-${ev.start.toISOString()}`);
      const start = new Date(ev.start);
      const end = ev.end ? new Date(ev.end) : start;
      const allDay = (ev as { datetype?: string }).datetype === 'date';

      await prisma.calendarEvent.upsert({
        where: { integrationId_externalId: { integrationId: integ.id, externalId } },
        create: {
          userId,
          integrationId: integ.id,
          source: 'canvas',
          externalId,
          title: String(ev.summary ?? 'Evento Canvas'),
          start,
          end,
          allDay,
          location: ev.location ? String(ev.location) : null,
          url: (ev as { url?: string }).url ? String((ev as { url?: string }).url) : null,
          category: 'canvas',
        },
        update: {
          title: String(ev.summary ?? 'Evento Canvas'),
          start,
          end,
          allDay,
          location: ev.location ? String(ev.location) : null,
        },
      });
      count++;
    }

    await markSync('canvas', { status: 'connected' }, userId);
    return { provider: 'canvas', ok: true, count };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await markSync('canvas', { status: 'error' }, userId);
    return { provider: 'canvas', ok: false, count: 0, error };
  }
}
