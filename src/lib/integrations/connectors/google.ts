import 'server-only';
import { google, type calendar_v3 } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { getDecrypted, saveIntegration, markSync } from '@/lib/integrations/vault';
import type { SyncResult } from '@/lib/integrations/connectors/canvas';

function oauthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
}

/**
 * Sincroniza eventos do Google Calendar (primary) → CalendarEvent (source=google).
 * Usa syncToken (em syncCursor) para sync incremental; faz full sync no primeiro
 * uso ou quando o token expira (410). Persiste tokens renovados no cofre.
 */
export async function syncGoogle(userId: string): Promise<SyncResult> {
  const found = await getDecrypted('google', userId);
  if (!found || (!found.refreshToken && !found.accessToken)) {
    return { provider: 'google', ok: false, count: 0, error: 'sem tokens' };
  }
  const integ = found; // alias não-nulo p/ uso em closures

  const auth = oauthClient();
  auth.setCredentials({
    refresh_token: integ.refreshToken ?? undefined,
    access_token: integ.accessToken ?? undefined,
    expiry_date: integ.expiresAt ? integ.expiresAt.getTime() : undefined,
  });

  // Persistir tokens renovados automaticamente.
  auth.on('tokens', (tokens) => {
    void saveIntegration(
      'google',
      {
        accessToken: tokens.access_token ?? undefined,
        refreshToken: tokens.refresh_token ?? undefined,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      },
      userId,
    );
  });

  const calendar = google.calendar({ version: 'v3', auth });

  // Nota: syncToken (incremental) é incompatível com timeMin/timeMax/orderBy.
  // Como precisamos da janela para não expandir recorrências ao infinito, fazemos
  // full sync da janela (-30d a +120d) e gravamos tudo num único $transaction
  // (rápido), em vez de centenas de round-trips sequenciais.
  function fetchPage(pageToken: string | undefined) {
    return calendar.events.list({
      calendarId: 'primary',
      singleEvents: true,
      maxResults: 250,
      timeMin: new Date(Date.now() - 30 * 864e5).toISOString(),
      timeMax: new Date(Date.now() + 120 * 864e5).toISOString(),
      orderBy: 'startTime',
      ...(pageToken ? { pageToken } : {}),
    });
  }

  try {
    const items: calendar_v3.Schema$Event[] = [];
    let pageToken: string | undefined;
    for (let guard = 0; guard < 50; guard++) {
      const resp = await fetchPage(pageToken);
      items.push(...(resp.data.items ?? []));
      pageToken = resp.data.nextPageToken ?? undefined;
      if (!pageToken) break;
    }

    const ops = items
      .filter((ev) => ev.id && ev.status !== 'cancelled')
      .map((ev) => {
        const externalId = ev.id!;
        const allDay = !!ev.start?.date;
        const start = new Date(ev.start?.dateTime ?? ev.start?.date ?? Date.now());
        const end = new Date(ev.end?.dateTime ?? ev.end?.date ?? start);
        const base = {
          title: ev.summary ?? '(sem título)',
          start,
          end,
          allDay,
          location: ev.location ?? null,
        };
        return prisma.calendarEvent.upsert({
          where: { integrationId_externalId: { integrationId: integ.id, externalId } },
          create: {
            userId,
            integrationId: integ.id,
            source: 'google',
            externalId,
            timezone: ev.start?.timeZone ?? null,
            url: ev.htmlLink ?? null,
            category: 'google',
            ...base,
          },
          update: base,
        });
      });

    await prisma.$transaction(ops);
    await markSync('google', { status: 'connected' }, userId);
    return { provider: 'google', ok: true, count: ops.length };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await markSync('google', { status: 'error' }, userId);
    return { provider: 'google', ok: false, count: 0, error };
  }
}
