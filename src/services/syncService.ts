import { UserProfile } from '../types';
import { getCurrentUser } from './authService';
import { getFoods, getMeals } from './storageService';
import { apiConfigured, apiSync, SyncData } from './apiService';

export const GUEST_EMAIL = 'visitante@vitalis.app';
const SYNC_DEBOUNCE_MS = 1500;

let timer: ReturnType<typeof setTimeout> | undefined;

// Lê todas as chaves de água do usuário (nutriflow_water_<email>_<data>) num mapa.
function waterMap(email: string): Record<string, number> {
  const prefix = `nutriflow_water_${email}_`;
  const map: Record<string, number> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      map[key.slice(prefix.length)] = Number(localStorage.getItem(key) || 0);
    }
  }
  return map;
}

/** Monta o retrato completo dos dados do usuário a partir do localStorage. */
export function buildSnapshot(user: UserProfile): SyncData {
  return { profile: user, foods: getFoods(), meals: getMeals(), water: waterMap(user.email) };
}

/** Grava no localStorage os dados vindos da planilha (após login/registro). */
export function restoreSnapshot(email: string, data?: SyncData): void {
  if (!data) return;
  if (data.foods) localStorage.setItem(`nutriflow_foods_${email}`, JSON.stringify(data.foods));
  if (data.meals) localStorage.setItem(`nutriflow_meals_${email}`, JSON.stringify(data.meals));
  if (data.water) {
    Object.entries(data.water).forEach(([date, ml]) => {
      localStorage.setItem(`nutriflow_water_${email}_${date}`, String(ml));
    });
  }
}

/**
 * Agenda um envio (debounced) do snapshot atual para a planilha.
 * Não faz nada se não houver backend configurado, sem sessão, ou se for visitante.
 */
export function scheduleSync(): void {
  if (!apiConfigured()) return;
  const user = getCurrentUser();
  if (!user || user.email === GUEST_EMAIL) return;

  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    apiSync(user.email, buildSnapshot(user)).catch(err => console.warn('Sync falhou:', err?.message || err));
  }, SYNC_DEBOUNCE_MS);
}
