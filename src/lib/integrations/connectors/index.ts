import 'server-only';
import { prisma } from '@/lib/prisma';
import { syncCanvas, type SyncResult } from '@/lib/integrations/connectors/canvas';
import { syncGoogle } from '@/lib/integrations/connectors/google';
import { syncClickUp } from '@/lib/integrations/connectors/clickup';

export type { SyncResult };

/**
 * Roda a sincronização de todas as integrações conectadas do usuário.
 * Cada conector é isolado: falha de um não derruba os outros.
 */
export async function syncAll(userId: string): Promise<SyncResult[]> {
  const integrations = await prisma.integration.findMany({ where: { userId } });
  const providers = new Set(integrations.map((i) => i.provider));
  const jobs: Promise<SyncResult>[] = [];

  if (providers.has('canvas')) jobs.push(syncCanvas(userId));
  if (providers.has('google')) jobs.push(syncGoogle(userId));
  if (providers.has('clickup')) jobs.push(syncClickUp(userId));

  if (jobs.length === 0) return [];
  return Promise.all(jobs);
}
