import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { daysAgoInTimezone } from '@/lib/timezone';
import BarChartSimple from '@/components/charts/BarChartSimple';
import PageFrame from '@/components/PageFrame';
import ModIcon from '@/components/ModIcon';

export const dynamic = 'force-dynamic';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function RelatoriosPage() {
  const user = await getCurrentUser();
  const since = daysAgoInTimezone(user.timezone, 30);

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

  const barCatData = catRows.slice(0, 7).map(([cat, val]) => ({
    label: cat.slice(0, 9),
    value: Math.round(val),
  }));

  return (
    <PageFrame>
      <header className="flex-shrink-0 flex items-center gap-3 pt-2">
        <ModIcon mod="relatorios" size="lg" />
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Insights</h1>
          <p className="text-sm font-bold" style={{ color: 'var(--mod-relatorios)' }}>
            {format(since, "dd 'de' MMM", { locale: ptBR })} → hoje
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clay-card p-5" style={{ borderTop: '3px solid var(--mod-tarefas)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-soft)' }}>Receitas</p>
          <p className="text-2xl font-black" style={{ color: 'var(--mod-tarefas-strong)' }}>{brl(income)}</p>
        </div>
        <div className="clay-card p-5" style={{ borderTop: '3px solid var(--mod-notif)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-soft)' }}>Despesas</p>
          <p className="text-2xl font-black" style={{ color: 'var(--mod-notif-strong)' }}>{brl(expense)}</p>
        </div>
        <div className="clay-card p-5" style={{ borderTop: '3px solid var(--mod-agua)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-soft)' }}>Média água/dia</p>
          <p className="text-2xl font-black" style={{ color: 'var(--mod-agua-strong)' }}>{avgWater}ml</p>
        </div>
        <div className="clay-card p-5" style={{ borderTop: '3px solid var(--mod-dieta)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-soft)' }}>Kcal (total)</p>
          <p className="text-2xl font-black" style={{ color: 'var(--mod-dieta-strong)' }}>{totalCalories}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="clay-card p-5">
          <h2 className="text-base font-extrabold mb-4" style={{ color: 'var(--text-strong)' }}>Gasto por categoria</h2>
          {catRows.length === 0 && (
            <p className="font-bold text-sm" style={{ color: 'var(--text-soft)' }}>Sem despesas no período.</p>
          )}
          {barCatData.length > 0 && (
            <BarChartSimple data={barCatData} color="var(--mod-financas)" height={150} unit="R$" />
          )}
          <div className="space-y-2.5 mt-4">
            {catRows.map(([cat, val]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm font-bold mb-1" style={{ color: 'var(--text-soft)' }}>
                  <span>{cat}</span>
                  <span style={{ color: 'var(--mod-financas-strong)' }}>{brl(val)}</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--mod-financas-bg)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(val / maxCat) * 100}%`, background: 'var(--mod-financas)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="clay-card p-5">
          <h2 className="text-base font-extrabold mb-4" style={{ color: 'var(--text-strong)' }}>Progresso das metas</h2>
          {goals.length === 0 && (
            <p className="font-bold text-sm" style={{ color: 'var(--text-soft)' }}>Nenhuma meta.</p>
          )}
          <div className="space-y-4">
            {goals.map((g) => {
              const pct = g.target ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-sm font-bold mb-1" style={{ color: 'var(--text-soft)' }}>
                    <span>{g.title}</span>
                    <span style={{ color: 'var(--mod-metas)' }}>{pct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--mod-metas-bg)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--mod-metas)' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs font-bold mt-6" style={{ color: 'var(--text-soft)' }}>
            Saldo líquido:{' '}
            <span style={{ color: income >= expense ? 'var(--mod-tarefas-strong)' : 'var(--mod-notif-strong)' }}>
              {brl(income - expense)}
            </span>
          </p>
        </div>
      </div>
      </div>
    </PageFrame>
  );
}
