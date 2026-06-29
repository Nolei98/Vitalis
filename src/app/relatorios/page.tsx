import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { subDays, startOfDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function RelatoriosPage() {
  const user = await getCurrentUser();
  const since = subDays(startOfDay(new Date()), 30);

  const [transactions, waterLogs, meals, goals] = await Promise.all([
    prisma.transaction.findMany({ where: { userId: user.id, date: { gte: since } } }),
    prisma.waterLog.findMany({ where: { userId: user.id, createdAt: { gte: since } } }),
    prisma.meal.findMany({ where: { userId: user.id, createdAt: { gte: since } } }),
    prisma.goal.findMany({ where: { userId: user.id, type: { not: 'vault' } } }),
  ]);

  const income = transactions.filter((t) => t.kind === 'income').reduce((a, t) => a + t.amount, 0);
  const expense = transactions.filter((t) => t.kind === 'expense').reduce((a, t) => a + t.amount, 0);

  const byCategory = new Map<string, number>();
  for (const t of transactions.filter((t) => t.kind === 'expense')) {
    const k = t.category || 'Outros';
    byCategory.set(k, (byCategory.get(k) ?? 0) + t.amount);
  }
  const catRows = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const maxCat = catRows[0]?.[1] ?? 1;

  const totalWater = waterLogs.reduce((a, w) => a + w.amount, 0);
  const totalCalories = meals.reduce((a, m) => a + (m.calories ?? 0), 0);
  const avgWater = Math.round(totalWater / 30);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
      <header>
        <h1 className="text-4xl font-extrabold text-[#4a3f72]">Vitalis <span className="text-[#9871F5]">Stats</span></h1>
        <p className="text-gray-500 font-bold">Últimos 30 dias</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="clay-card p-6 !bg-[#a8e6cf]">
          <p className="text-teal-900/70 text-sm font-bold">Receitas</p>
          <p className="text-2xl font-black text-teal-950 mt-1">{brl(income)}</p>
        </div>
        <div className="clay-card p-6 !bg-[#ffb6b9]">
          <p className="text-pink-900/70 text-sm font-bold">Despesas</p>
          <p className="text-2xl font-black text-pink-950 mt-1">{brl(expense)}</p>
        </div>
        <div className="clay-card p-6 !bg-[#fce38a]">
          <p className="text-amber-900/70 text-sm font-bold">Média água/dia</p>
          <p className="text-2xl font-black text-amber-950 mt-1">{avgWater}ml</p>
        </div>
        <div className="clay-card p-6 !bg-[#e0d4fc]">
          <p className="text-[#4a3f72]/70 text-sm font-bold">Calorias (total)</p>
          <p className="text-2xl font-black text-[#4a3f72] mt-1">{totalCalories}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="clay-card p-6">
          <h2 className="text-xl font-bold text-[#4a3f72] mb-4">Gasto por categoria</h2>
          {catRows.length === 0 && <p className="text-gray-400 font-bold">Sem despesas no período.</p>}
          <div className="space-y-3">
            {catRows.map(([cat, val]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm font-bold text-gray-600 mb-1">
                  <span>{cat}</span>
                  <span>{brl(val)}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#9871F5] rounded-full" style={{ width: `${(val / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="clay-card p-6">
          <h2 className="text-xl font-bold text-[#4a3f72] mb-4">Progresso das metas</h2>
          {goals.length === 0 && <p className="text-gray-400 font-bold">Nenhuma meta.</p>}
          <div className="space-y-3">
            {goals.map((g) => {
              const pct = g.target ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-sm font-bold text-gray-600 mb-1">
                    <span>{g.title}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 font-bold mt-6">
            Saldo líquido no período: <span className="text-[#4a3f72]">{brl(income - expense)}</span> ·{' '}
            {format(since, "dd 'de' MMM", { locale: ptBR })} → hoje
          </p>
        </div>
      </div>
    </div>
  );
}
