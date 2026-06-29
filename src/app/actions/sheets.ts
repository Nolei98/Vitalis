'use server';

import { getCurrentUserId } from '@/lib/user';
import { syncToSheets, sheetsConfigured } from '@/lib/integrations/sheets';

/** "Salvar no Drive" — envia nutrição/água do usuário para a planilha (Apps Script). */
export async function saveToSheets() {
  if (!sheetsConfigured()) {
    return { ok: false as const, error: 'Backend da planilha não configurado.' };
  }
  try {
    const userId = await getCurrentUserId();
    const res = await syncToSheets(userId);
    return { ok: true as const, meals: res.meals, foods: res.foods };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
}
