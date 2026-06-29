import 'server-only';
import { prisma } from '@/lib/prisma';

/**
 * Sync (push) dos dados de nutrição/água do LifeOS para o backend de planilha
 * do Vitalis (Google Apps Script Web App). Reusa o mesmo contrato e schema da
 * aba "Users" (Email/Name/PasswordHash/Profile/Foods/Meals/Water/UpdatedAt),
 * serializando Profile/Foods/Meals/Water como JSON.
 *
 * Direção: LifeOS (Prisma/SQLite) -> Planilha. One-way, sob demanda.
 * Config: SHEETS_API_URL (termina em /exec) e SHEETS_API_TOKEN (opcional,
 * precisa bater com a constante TOKEN no Code.gs).
 */

const API_URL = process.env.SHEETS_API_URL;
const API_TOKEN = process.env.SHEETS_API_TOKEN;

// Senha placeholder: o LifeOS nunca faz login pela planilha (auth é via Auth.js).
// Só serve para satisfazer o register_ do Apps Script ao criar a linha do usuário.
const REGISTER_PASSWORD = 'lifeos-sheets-sync';

export function sheetsConfigured(): boolean {
  return !!API_URL;
}

interface MacroTargets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface SheetsProfile {
  name: string;
  email: string;
  sex?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: string;
  goal?: string;
  targets?: MacroTargets;
}

interface SheetsFood {
  id: string;
  name: string;
  brand?: string;
  energyKcal: number;
  fatG: number;
  carbsG: number;
  proteinG: number;
  category?: string;
  goals?: string[];
  createdAt: number;
}

interface SheetsMealItem {
  id: string;
  foodId: string;
  foodName: string;
  amountGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface SheetsMealGroup {
  id: string;
  name: string;
  items: SheetsMealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  timestamp: number;
}

interface Snapshot {
  profile: SheetsProfile;
  foods: SheetsFood[];
  meals: SheetsMealGroup[];
  water: Record<string, number>;
}

function dateKey(d: Date): string {
  // yyyy-mm-dd em horário local do servidor (suficiente para agrupar o dia).
  return d.toISOString().slice(0, 10);
}

/** Monta o retrato completo dos dados de nutrição/água do usuário a partir do Prisma. */
export async function buildSnapshot(userId: string): Promise<Snapshot> {
  const [user, foods, meals, waterLogs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.food.findMany({ where: { userId } }),
    prisma.meal.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    prisma.waterLog.findMany({ where: { userId } }),
  ]);
  if (!user) throw new Error('Usuário não encontrado no banco local.');

  const profile: SheetsProfile = {
    name: user.name ?? 'Usuário LifeOS',
    email: user.email ?? '',
    sex: user.sex ?? undefined,
    age: user.age ?? undefined,
    heightCm: user.heightCm ?? undefined,
    weightKg: user.weightKg ?? undefined,
    activityLevel: user.activityLevel ?? undefined,
    goal: user.goal ?? undefined,
    targets:
      user.targetKcal != null
        ? {
            kcal: user.targetKcal ?? 0,
            protein: user.targetProtein ?? 0,
            carbs: user.targetCarbs ?? 0,
            fat: user.targetFat ?? 0,
          }
        : undefined,
  };

  const sheetFoods: SheetsFood[] = foods.map((f) => ({
    id: f.id,
    name: f.name,
    brand: f.brand ?? undefined,
    energyKcal: f.energyKcal,
    fatG: f.fatG,
    carbsG: f.carbsG,
    proteinG: f.proteinG,
    category: f.category ?? undefined,
    goals: f.goals ? f.goals.split(',').map((g) => g.trim()).filter(Boolean) : undefined,
    createdAt: f.createdAt.getTime(),
  }));

  // Agrupa linhas Meal por dia+tipo -> uma MealGroup com vários itens.
  const groups = new Map<string, SheetsMealGroup>();
  for (const m of meals) {
    const key = `${dateKey(m.createdAt)}|${m.type}`;
    let g = groups.get(key);
    if (!g) {
      g = {
        id: key,
        name: m.type,
        items: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        timestamp: m.createdAt.getTime(),
      };
      groups.set(key, g);
    }
    const cal = m.calories ?? 0;
    const pro = m.protein ?? 0;
    const carb = m.carbs ?? 0;
    const fat = m.fat ?? 0;
    g.items.push({
      id: m.id,
      foodId: m.foodId ?? '',
      foodName: m.food,
      amountGrams: m.grams ?? 0,
      calories: cal,
      protein: pro,
      carbs: carb,
      fat: fat,
    });
    g.totalCalories += cal;
    g.totalProtein += pro;
    g.totalCarbs += carb;
    g.totalFat += fat;
  }

  const water: Record<string, number> = {};
  for (const w of waterLogs) {
    const key = dateKey(w.createdAt);
    water[key] = (water[key] ?? 0) + w.amount;
  }

  return { profile, foods: sheetFoods, meals: [...groups.values()], water };
}

interface SheetsResponse {
  ok: boolean;
  error?: string;
}

/**
 * POST para o Apps Script. Content-Type text/plain de propósito (o Apps Script
 * lê e.postData.contents cru); no servidor não há CORS, mas mantemos o contrato.
 */
async function call(payload: Record<string, unknown>): Promise<SheetsResponse> {
  if (!API_URL) throw new Error('SHEETS_API_URL não configurada.');
  const res = await fetch(API_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, token: API_TOKEN }),
  });
  const data = (await res.json()) as SheetsResponse;
  return data;
}

/**
 * Garante que a linha do usuário exista na planilha e grava o snapshot atual.
 * Se a linha não existir (sync_ devolve "não encontrado"), registra primeiro.
 */
export async function syncToSheets(userId: string): Promise<{ ok: true; meals: number; foods: number }> {
  if (!sheetsConfigured()) throw new Error('Backend da planilha não configurado (SHEETS_API_URL).');

  const snapshot = await buildSnapshot(userId);
  const email = snapshot.profile.email;
  if (!email) throw new Error('Usuário sem e-mail; não dá para chavear na planilha.');

  let resp = await call({ action: 'sync', email, ...snapshot });

  // Linha ainda não existe -> registra e tenta de novo.
  if (!resp.ok && /não encontrado|nao encontrado|not found/i.test(resp.error ?? '')) {
    const reg = await call({
      action: 'register',
      name: snapshot.profile.name,
      email,
      password: REGISTER_PASSWORD,
    });
    // "já cadastrado" também é aceitável (corrida); só falha em erro real.
    if (!reg.ok && !/já está cadastrado|ja esta cadastrado|already/i.test(reg.error ?? '')) {
      throw new Error(reg.error || 'Falha ao registrar usuário na planilha.');
    }
    resp = await call({ action: 'sync', email, ...snapshot });
  }

  if (!resp.ok) throw new Error(resp.error || 'Falha ao sincronizar com a planilha.');
  return { ok: true, meals: snapshot.meals.length, foods: snapshot.foods.length };
}
