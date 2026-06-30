import 'server-only';
import { prisma } from '@/lib/prisma';
import { getDecrypted, saveIntegration, markSync } from '@/lib/integrations/vault';
import type { SyncResult } from '@/lib/integrations/connectors/canvas';

const API = 'https://api.clickup.com/api/v2';

async function cu(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: token, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`ClickUp ${res.status} ${path}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

/** Descobre o primeiro workspace (team) e guarda o id em syncCursor. */
async function resolveTeamId(token: string, cached: string | null, userId: string): Promise<string> {
  if (cached) return cached;
  const data = await cu('/team', token);
  const teamId = data?.teams?.[0]?.id;
  if (!teamId) throw new Error('nenhum workspace ClickUp encontrado');
  await saveIntegration('clickup', { syncCursor: teamId }, userId);
  return teamId;
}

/**
 * Importa tasks com data do ClickUp → Task (source=clickup).
 * ClickUp é a fonte da verdade para tasks importadas (evita loop de sync).
 */
export async function syncClickUp(userId: string): Promise<SyncResult> {
  const integ = await getDecrypted('clickup', userId);
  if (!integ?.accessToken) return { provider: 'clickup', ok: false, count: 0, error: 'sem token' };

  try {
    const token = integ.accessToken;
    const teamId = await resolveTeamId(token, integ.syncCursor, userId);

    const data = await cu(
      `/team/${teamId}/task?subtasks=true&include_closed=true&order_by=due_date`,
      token,
    );
    const tasks: Array<{
      id: string;
      name: string;
      status?: { status?: string; type?: string };
      due_date?: string | null;
      list?: { name?: string };
    }> = data?.tasks ?? [];

    let count = 0;
    for (const t of tasks) {
      const completed = t.status?.type === 'closed' || t.status?.type === 'done';
      const due = t.due_date ? new Date(Number(t.due_date)) : null;
      const existing = await prisma.task.findFirst({
        where: { userId, source: 'clickup', externalId: t.id },
      });
      const payload = {
        title: t.name,
        status: completed ? 'completed' : 'pending',
        due,
        project: t.list?.name ?? 'ClickUp',
      };
      if (existing) {
        await prisma.task.update({ where: { id: existing.id }, data: payload });
      } else {
        await prisma.task.create({
          data: { userId, source: 'clickup', externalId: t.id, priority: 0, ...payload },
        });
      }
      count++;
    }

    await markSync('clickup', { status: 'connected' }, userId);
    return { provider: 'clickup', ok: true, count };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await markSync('clickup', { status: 'error' }, userId);
    return { provider: 'clickup', ok: false, count: 0, error };
  }
}

/** Empurra mudança de status de volta ao ClickUp (chamado ao concluir task local). */
export async function pushClickUpStatus(
  userId: string,
  externalId: string,
  completed: boolean,
): Promise<void> {
  const integ = await getDecrypted('clickup', userId);
  if (!integ?.accessToken) return;
  try {
    await cu(`/task/${externalId}`, integ.accessToken, {
      method: 'PUT',
      body: JSON.stringify({ status: completed ? 'complete' : 'to do' }),
    });
  } catch {
    // best-effort; status do ClickUp será reconciliado no próximo sync
  }
}
