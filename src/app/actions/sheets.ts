'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/user';
import { syncToSheets, syncAllUsersToSheets, sheetsConfigured } from '@/lib/integrations/sheets';

/** "Salvar no Drive" — envia nutrição/água do usuário logado para a planilha. */
export async function saveToSheets() {
  if (!sheetsConfigured()) {
    return { ok: false as const, error: 'Backend da planilha não configurado.' };
  }
  try {
    const userId = await getCurrentUserId();
    const res = await syncToSheets(userId);
    revalidatePath('/usuarios');
    return { ok: true as const, meals: res.meals, foods: res.foods };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Backup de um usuário específico (página Usuários). */
export async function backupUser(userId: string) {
  if (!sheetsConfigured()) {
    return { ok: false as const, error: 'Backend da planilha não configurado.' };
  }
  try {
    const res = await syncToSheets(userId);
    revalidatePath('/usuarios');
    return { ok: true as const, meals: res.meals, foods: res.foods };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Backup de TODOS os usuários (botão manual + espelha o cron de domingo). */
export async function backupAllUsers() {
  if (!sheetsConfigured()) {
    return { ok: false as const, error: 'Backend da planilha não configurado.' };
  }
  try {
    const res = await syncAllUsersToSheets();
    revalidatePath('/usuarios');
    return { ok: true as const, ...res };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
}
