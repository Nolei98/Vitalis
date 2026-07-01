import 'server-only';
import ical from 'node-ical';
import { prisma } from '@/lib/prisma';
import { getDecrypted, markSync } from '@/lib/integrations/vault';
import type { SyncResult } from '@/lib/integrations/connectors/canvas';

/**
 * Lê o link público .ics do Google Calendar (Configurações > Integrar agenda >
 * "Endereço público em formato iCal") e faz upsert em CalendarEvent (source=google).
 * Sem OAuth: evita cadastro de app no Google Cloud Console.
 */
export async function syncGoogle(userId: string): Promise<SyncResult> {
  const integ = await getDecrypted('google', userId);
  if (!integ?.icalUrl) return { provider: 'google', ok: false, count: 0, error: 'sem icalUrl' };

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
          source: 'google',
          externalId,
          title: String(ev.summary ?? '(sem título)'),
          start,
          end,
          allDay,
          location: ev.location ? String(ev.location) : null,
          url: (ev as { url?: string }).url ? String((ev as { url?: string }).url) : null,
          category: 'google',
        },
        update: {
          title: String(ev.summary ?? '(sem título)'),
          start,
          end,
          allDay,
          location: ev.location ? String(ev.location) : null,
        },
      });
      count++;
    }

    await markSync('google', { status: 'connected' }, userId);
    return { provider: 'google', ok: true, count };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await markSync('google', { status: 'error' }, userId);
    return { provider: 'google', ok: false, count: 0, error };
  }
}
