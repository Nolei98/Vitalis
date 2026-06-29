import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { createGoal, updateGoalProgress, deleteGoal } from '@/app/actions/goals';
import { createHabit, deleteHabit, toggleHabitToday } from '@/app/actions/habits';
import { startOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function MetasPage() {
  const user = await getCurrentUser();
  const today = startOfDay(new Date());

  const [goals, habits, todayLogs] = await Promise.all([
    prisma.goal.findMany({ where: { userId: user.id, type: { not: 'vault' } }, orderBy: { deadline: 'asc' } }),
    prisma.habit.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'asc' } }),
    prisma.habitLog.findMany({ where: { userId: user.id, date: { gte: today } } }),
  ]);
  const doneToday = new Set(todayLogs.map((l) => l.habitId));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
      <header>
        <h1 className="text-4xl font-extrabold text-[#4a3f72]">Vitalis <span className="text-[#9871F5]">Metas</span></h1>
        <p className="text-gray-500 font-bold">Acompanhe seu progresso</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Metas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="clay-card p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#4a3f72]">🎯 Metas</h2>
            {goals.length === 0 && <p className="text-gray-400 font-bold text-center py-4">Nenhuma meta ainda.</p>}
            {goals.map((g) => {
              const pct = g.target ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
              return (
                <div key={g.id} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-700">{g.title}</p>
                      <p className="text-xs font-bold text-gray-400">
                        {g.metric ?? 'meta'} · {g.status === 'done' ? '✅ concluída' : g.type}
                      </p>
                    </div>
                    <form action={deleteGoal}>
                      <input type="hidden" name="id" value={g.id} />
                      <button className="text-xs text-red-400 font-bold hover:underline">remover</button>
                    </form>
                  </div>
                  {g.target != null && (
                    <>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#9871F5] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-bold text-gray-500">{g.current} / {g.target} ({pct}%)</span>
                        <form action={updateGoalProgress} className="flex gap-1">
                          <input type="hidden" name="id" value={g.id} />
                          <input name="current" type="number" step="any" defaultValue={g.current} className="clay-card w-20 px-2 py-1 text-xs outline-none" />
                          <button className="clay-btn bg-[#9871F5] text-white text-xs font-bold px-3">ok</button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <form action={createGoal} className="clay-card p-6 grid grid-cols-2 gap-3">
            <h2 className="col-span-2 text-lg font-bold text-[#4a3f72]">Nova Meta</h2>
            <input name="title" placeholder="Título" required className="col-span-2 clay-card px-4 py-2 text-sm outline-none" />
            <input name="metric" placeholder="Métrica (ex: kg, R$, páginas)" className="clay-card px-4 py-2 text-sm outline-none" />
            <input name="target" type="number" step="any" placeholder="Alvo" className="clay-card px-4 py-2 text-sm outline-none" />
            <select name="type" className="clay-card px-4 py-2 text-sm outline-none">
              <option value="short">Curto prazo</option>
              <option value="medium">Médio prazo</option>
              <option value="long">Longo prazo</option>
            </select>
            <input name="deadline" type="date" className="clay-card px-4 py-2 text-sm outline-none" />
            <button className="col-span-2 clay-btn bg-[#9871F5] text-white font-bold py-2">Adicionar Meta +</button>
          </form>
        </div>

        {/* Hábitos */}
        <div className="space-y-4">
          <div className="clay-card p-6 space-y-3">
            <h2 className="text-xl font-bold text-[#4a3f72]">🔁 Hábitos</h2>
            {habits.length === 0 && <p className="text-gray-400 font-bold text-center py-4">Sem hábitos.</p>}
            {habits.map((h) => {
              const done = doneToday.has(h.id);
              return (
                <div key={h.id} className="flex items-center justify-between border border-gray-100 rounded-2xl p-3">
                  <div>
                    <p className="font-bold text-gray-700">{h.title}</p>
                    <p className="text-xs font-bold text-orange-400">🔥 {h.streak} dias</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={toggleHabitToday}>
                      <input type="hidden" name="id" value={h.id} />
                      <button className={`clay-btn text-sm font-bold px-3 py-2 ${done ? 'bg-emerald-400 text-white' : 'bg-white text-gray-500'}`}>
                        {done ? '✓ hoje' : 'marcar'}
                      </button>
                    </form>
                    <form action={deleteHabit}>
                      <input type="hidden" name="id" value={h.id} />
                      <button className="text-xs text-red-400 font-bold">✕</button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>

          <form action={createHabit} className="clay-card p-6 space-y-3">
            <h2 className="text-lg font-bold text-[#4a3f72]">Novo Hábito</h2>
            <input name="title" placeholder="Ex: Ler 20 min" required className="clay-card w-full px-4 py-2 text-sm outline-none" />
            <select name="frequency" className="clay-card w-full px-4 py-2 text-sm outline-none">
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
            </select>
            <button className="clay-btn w-full bg-[#9871F5] text-white font-bold py-2">Adicionar +</button>
          </form>
        </div>
      </div>
    </div>
  );
}
