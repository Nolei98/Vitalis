import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { createGoal, updateGoalProgress, deleteGoal } from '@/app/actions/goals';
import { createHabit, deleteHabit } from '@/app/actions/habits';
import { startSessionAction } from '@/app/actions/study';
import { dayRangeInTimezone } from '@/lib/timezone';
import DonutRing from '@/components/charts/DonutRing';
import PageFrame from '@/components/PageFrame';
import ModIcon from '@/components/ModIcon';
import HabitToggle from '@/components/HabitToggle';
import { Target, RefreshCw, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MetasPage() {
  const user = await getCurrentUser();
  const { start: today } = dayRangeInTimezone(user.timezone);

  const [goals, habits, todayLogs] = await Promise.all([
    prisma.goal.findMany({ where: { userId: user.id, type: { not: 'vault' } }, orderBy: { deadline: 'asc' } }),
    prisma.habit.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } }),
    prisma.habitLog.findMany({ where: { userId: user.id, date: { gte: today } } }),
  ]);
  const doneToday = new Set(todayLogs.map((l) => l.habitId));

  return (
    <PageFrame>
      <header className="flex-shrink-0 flex items-center gap-3 pt-2">
        <ModIcon mod="metas" size="lg" />
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Metas</h1>
          <p className="text-sm font-bold" style={{ color: 'var(--mod-metas)' }}>Acompanhe seu progresso</p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="clay-card p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} strokeWidth={2} style={{ color: 'var(--mod-metas)' }} />
              <h2 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Minhas Metas</h2>
            </div>
            {goals.length === 0 && (
              <p className="text-center py-6 font-bold text-sm" style={{ color: 'var(--text-soft)' }}>
                Nenhuma meta ainda.
              </p>
            )}
            {goals.map((g) => {
              const pct = g.target ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
              return (
                <div key={g.id} className="flex gap-4 items-center p-3 rounded-2xl"
                  style={{ background: 'var(--mod-metas-bg)' }}>
                  <DonutRing
                    percent={pct}
                    color="var(--mod-metas)"
                    size={64}
                    strokeWidth={7}
                    label={`${pct}%`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm truncate" style={{ color: 'var(--text-strong)' }}>{g.title}</p>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>
                      {g.metric ?? 'meta'} · {g.status === 'done' ? '· concluída' : g.type}
                    </p>
                    {g.target != null && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--mod-metas)' }} />
                        </div>
                        <span className="text-[11px] font-bold shrink-0" style={{ color: 'var(--mod-metas-strong)' }}>
                          {g.current}/{g.target}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    {g.target != null && (
                      <form action={updateGoalProgress} className="flex gap-1">
                        <input type="hidden" name="id" value={g.id} />
                        <input name="current" type="number" step="any" defaultValue={g.current}
                          className="clay-inset w-16 px-2 py-1 text-xs outline-none text-center" />
                        <button className="clay-btn text-white text-xs font-bold px-2 py-1"
                          style={{ background: 'var(--mod-metas)' }}>ok</button>
                      </form>
                    )}
                    <form action={startSessionAction}>
                      <input type="hidden" name="sourceType" value="goal" />
                      <input type="hidden" name="sourceId" value={g.id} />
                      <input type="hidden" name="label" value={g.title} />
                      <button type="submit" className="flex items-center gap-1 text-[10px] font-bold" style={{ color: 'var(--mod-estudos)' }}>
                        <BookOpen size={11} strokeWidth={2.2} /> foco YPT
                      </button>
                    </form>
                    <form action={deleteGoal}>
                      <input type="hidden" name="id" value={g.id} />
                      <button className="text-[10px] font-bold" style={{ color: '#FB7185' }}>remover</button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>

          <form action={createGoal} className="clay-card p-5 grid grid-cols-2 gap-3">
            <h2 className="col-span-2 text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Nova Meta</h2>
            <input name="title" placeholder="Título" required className="col-span-2 clay-inset px-4 py-2 text-sm outline-none" style={{ color: 'var(--clay-text)' }} />
            <input name="metric" placeholder="Métrica (ex: kg, R$, páginas)" className="clay-inset px-4 py-2 text-sm outline-none" style={{ color: 'var(--clay-text)' }} />
            <input name="target" type="number" step="any" placeholder="Alvo" className="clay-inset px-4 py-2 text-sm outline-none" style={{ color: 'var(--clay-text)' }} />
            <select name="type" className="clay-inset px-4 py-2 text-sm outline-none" style={{ color: 'var(--clay-text)' }}>
              <option value="short">Curto prazo</option>
              <option value="medium">Médio prazo</option>
              <option value="long">Longo prazo</option>
            </select>
            <input name="deadline" type="date" className="clay-inset px-4 py-2 text-sm outline-none" style={{ color: 'var(--clay-text)' }} />
            <button className="col-span-2 clay-btn text-white font-bold py-2"
              style={{ background: 'var(--mod-metas)' }}>Adicionar Meta +</button>
          </form>
        </div>

        {/* Hábitos */}
        <div className="space-y-4">
          <div className="clay-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw size={15} strokeWidth={2} style={{ color: 'var(--mod-metas)' }} />
              <h2 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Hábitos</h2>
            </div>
            {habits.length === 0 && (
              <p className="text-center py-4 font-bold text-sm" style={{ color: 'var(--text-soft)' }}>Sem hábitos.</p>
            )}
            {habits.map((h) => {
              const done = doneToday.has(h.id);
              return (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-2xl"
                  style={{ background: done ? 'var(--mod-tarefas-bg)' : 'var(--mod-metas-bg)' }}>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-strong)' }}>{h.title}</p>
                    <p className="text-xs font-bold" style={{ color: '#FFB020' }}>🔥 {h.streak} dias</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <HabitToggle habitId={h.id} done={done} />
                    <form action={deleteHabit}>
                      <input type="hidden" name="id" value={h.id} />
                      <button className="text-xs font-bold" style={{ color: '#FB7185' }}>✕</button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>

          <form action={createHabit} className="clay-card p-5 space-y-3">
            <h2 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Novo Hábito</h2>
            <input name="title" placeholder="Ex: Ler 20 min" required className="clay-inset w-full px-4 py-2 text-sm outline-none" style={{ color: 'var(--clay-text)' }} />
            <select name="frequency" className="clay-inset w-full px-4 py-2 text-sm outline-none" style={{ color: 'var(--clay-text)' }}>
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
            </select>
            <button className="clay-btn w-full text-white font-bold py-2"
              style={{ background: 'var(--mod-metas)' }}>Adicionar +</button>
          </form>
        </div>
      </div>
      </div>
    </PageFrame>
  );
}
