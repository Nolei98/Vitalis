import { FoodItem, MealGroup, UserProfile } from '../types';

// Variáveis de ambiente do Vite (definidas em .env.local / Vercel).
const env = (import.meta as any).env || {};
const API_URL: string | undefined = env.VITE_SHEETS_API_URL;
const API_TOKEN: string | undefined = env.VITE_SHEETS_API_TOKEN;

export interface SyncData {
  profile: UserProfile;
  foods: FoodItem[];
  meals: MealGroup[];
  water: Record<string, number>;
}

export interface AuthResult {
  user: UserProfile;
  data: SyncData;
}

/** Há um backend de planilha configurado? Se não, o app opera só com localStorage. */
export const apiConfigured = (): boolean => !!API_URL;

/**
 * Chama o Apps Script. Usa Content-Type text/plain de propósito: isso evita o
 * preflight CORS (requisição "simples"), que o Apps Script não trata bem.
 */
async function call(payload: Record<string, unknown>): Promise<any> {
  if (!API_URL) throw new Error('Backend da planilha não configurado.');
  const res = await fetch(API_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, token: API_TOKEN }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Erro no servidor.');
  return data;
}

export const apiRegister = (name: string, email: string, password: string): Promise<AuthResult> =>
  call({ action: 'register', name, email, password });

export const apiLogin = (email: string, password: string): Promise<AuthResult> =>
  call({ action: 'login', email, password });

export const apiSync = (email: string, snapshot: SyncData): Promise<{ ok: true }> =>
  call({ action: 'sync', email, ...snapshot });
