import 'server-only';
import ical from 'node-ical';
import { prisma } from '@/lib/prisma';
import { getDecrypted, markSync } from '@/lib/integrations/vault';
import type { SyncResult } from '@/lib/integrations/connectors/canvas';

/**
 * Lê o(s) link(s) .ics do Google Calendar (Configurações > Integrar agenda >
 * "Endereço secreto/público em formato iCal") e faz upsert em CalendarEvent
 * (source=google). Aceita múltiplas URLs (uma por linha ou separadas por vírgula)
 * pra juntar várias agendas do mesmo usuário numa sincronização só.
 * Sem OAuth: evita cadastro de app no Google Cloud Console.
 */
export async function syncGoogle(userId: string): Promise<SyncResult> {
  const integ = await getDecrypted('google', userId);
  if (!integ?.icalUrl) return { provider: 'google', ok: false, count: 0, error: 'sem icalUrl' };

  const urls = integ.icalUrl
    .split(/[\n,]+/)
    .map((u) => u.trim())
    .filter(Boolean);

  try {
    const events: ical.VEvent[] = [];
    for (const url of urls) {
      const data = await ical.async.fromURL(url);
      events.push(
        ...Object.values(data).filter(
          (e): e is ical.VEvent => (e as ical.VEvent).type === 'VEVENT',
        ),
      );
    }

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
