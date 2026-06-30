'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/user';
import { syncAll } from '@/lib/integrations/connectors';

/** "Sincronizar agora" — roda todos os conectores conectados. */
export async function syncNow() {
  const userId = await getCurrentUserId();
  const results = await syncAll(userId);
  revalidatePath('/agenda');
  revalidatePath('/tarefas');
  revalidatePath('/conexoes');
  revalidatePath('/');
  return { results };
}
