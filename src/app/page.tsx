import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import TaskCheckbox from '@/components/TaskCheckbox';
import WaterButtons from '@/components/WaterButtons';
import BalanceDisplay from '@/components/BalanceDisplay';
import { fmtTime, sourceColor } from '@/lib/calendar';
import { startOfDay, endOfDay, startOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

const WATER_GOAL = 2000;

export default async function Dashboard() {
  const user = await getCurrentUser();
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const [events, pendingTasks, waterLogs, meals, finAccounts, budgets, monthTx, goals] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: { userId: user.id, start: { gte: dayStart, lte: dayEnd } },
      orderBy: { start: 'asc' },
    }),
    prisma.task.findMany({
      where: { userId: user.id, status: 'pending' },
      orderBy: [{ priority: 'desc' }, { due: 'asc' }],
    }),
    prisma.waterLog.findMany({ where: { userId: user.id, createdAt: { gte: dayStart, lte: dayEnd } } }),
    prisma.meal.findMany({ where: { userId: user.id, createdAt: { gte: dayStart, lte: dayEnd } } }),
    prisma.finAccount.findMany({ where: { userId: user.id } }),
    prisma.budget.findMany({ where: { userId: user.id } }),
    prisma.transaction.findMany({ where: { userId: user.id, kind: 'expense', date: { gte: startOfMonth(now) } } }),
    prisma.goal.findMany({ where: { userId: user.id, type: { not: 'vault' }, status: 'active' } }),
  ]);

  const totalWater = waterLogs.reduce((a, l) => a + l.amount, 0);
  const waterPercent = Math.min(Math.round((totalWater / WATER_GOAL) * 100), 100);
  const strokeDashoffset = 440 - (440 * waterPercent) / 100;
  const topTasks = pendingTasks.slice(0, 3);
  const totalBalance = finAccounts.reduce((a, acc) => a + acc.balance, 0);
  const calories = meals.reduce((a, m) => a + (m.calories ?? 0), 0);
  const protein = meals.reduce((a, m) => a + (m.protein ?? 0), 0);

  // Alertas: orçamentos estourados + tarefas vencendo hoje
  const spentByCat = new Map<string, number>();
  for (const t of monthTx) {
    const k = (t.category || 'Outros').toLowerCase();
    spentByCat.set(k, (spentByCat.get(k) ?? 0) + t.amount);
  }
  const overBudget = budgets.filter((b) => (spentByCat.get(b.category.toLowerCase()) ?? 0) > b.limit);
  const dueToday = pendingTasks.filter((t) => t.due && t.due >= dayStart && t.due <= dayEnd);
  const alertCount = overBudget.length + dueToday.length;

  const nextEvent = events.find((e) => !e.allDay && e.start >= now) ?? events[0];
  const nextAction = nextEvent
    ? `${nextEvent.allDay ? 'Hoje' : fmtTime(nextEvent.start)} — ${nextEvent.title}`
    : topTasks[0]
      ? `Tarefa: ${topTasks[0].title}`
      : 'Aproveite o dia livre! 🎉';

  return (
    <div className="space-y-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-[#4a3f72]">Vitalis <span className="text-[#9871F5]">Hub</span></h1>
        <div className="flex gap-4">
          <a href="/notificacoes" className="clay-card w-10 h-10 flex items-center justify-center text-[#9871F5] font-bold relative">
            🔔
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ffb6b9] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </a>
          <a href="/conexoes" className="clay-card w-10 h-10 flex items-center justify-center text-[#9871F5] font-bold">🔌</a>
        </div>
      </header>

      {/* Welcome / próxima ação */}
      <div className="clay-panel !bg-[#a78bfa] p-8 flex items-center justify-between text-white overflow-hidden relative">
        <div className="z-10">
          <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-sm">Bom dia, {user.name}! ☀️</h2>
          <p className="text-purple-100 mb-1 font-medium">Próxima ação:</p>
          <p className="text-white font-bold mb-6">{nextAction}</p>
          <a href="/agenda" className="clay-btn inline-block bg-[#9871F5] text-white border-2 border-white/20 font-bold px-6 py-2">▶ Ver Agenda</a>
        </div>
        <div className="absolute right-[-5%] top-[-50%] w-[300px] h-[300px] bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="clay-card p-6 !bg-[#9871F5] text-white">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm border border-white/20">💰</div>
          <p className="text-purple-200 text-sm font-bold">Saldo Atual</p>
          <BalanceDisplay balance={totalBalance} size="small" />
          <p className={`text-xs mt-2 font-bold ${overBudget.length ? 'text-pink-200' : 'text-purple-300'}`}>
            {overBudget.length ? `⚠️ ${overBudget.length} orçamento(s) estourado(s)` : `${finAccounts.length} contas`}
          </p>
        </div>

        <div className="clay-card p-6 flex flex-col justify-center">
          <div className="w-12 h-12 bg-[#e0d4fc] rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm border border-white">📅</div>
          <p className="text-gray-500 text-sm font-bold">Eventos Hoje</p>
          <p className="text-3xl font-black text-[#4a3f72] mt-1">{events.length}</p>
          <p className="text-emerald-500 text-xs mt-2 font-bold">{dueToday.length} tarefa(s) hoje</p>
        </div>

        <div className="clay-card p-6 !bg-[#ffb6b9]">
          <div className="w-12 h-12 bg-white/40 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm border border-white/30">✅</div>
          <p className="text-pink-900/70 text-sm font-bold">Pendentes</p>
          <p className="text-3xl font-black text-pink-950 mt-1">{pendingTasks.length}</p>
          <p className="text-pink-800 text-xs mt-2 font-bold">tarefas em aberto</p>
        </div>

        <div className="clay-card p-6 !bg-[#fce38a]">
          <div className="w-12 h-12 bg-white/40 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm border border-white/30">💧</div>
          <p className="text-amber-900/70 text-sm font-bold">Água Hoje</p>
          <p className="text-3xl font-black text-amber-950 mt-1">{totalWater}ml</p>
          <p className="text-emerald-700 text-xs mt-2 font-bold">{waterPercent}% da meta</p>
        </div>

        <div className="clay-card p-6 !bg-[#a8e6cf]">
          <div className="w-12 h-12 bg-white/40 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm border border-white/30">🥗</div>
          <p className="text-teal-900/70 text-sm font-bold">Refeições</p>
          <p className="text-3xl font-black text-teal-950 mt-1">{meals.length}</p>
          <p className="text-teal-800 text-xs mt-2 font-bold">
            {user.targetKcal
              ? `${calories}/${user.targetKcal} kcal · ${Math.min(100, Math.round((calories / user.targetKcal) * 100))}%`
              : `${calories} kcal · ${protein}g prot`}
          </p>
        </div>
      </div>

      {/* Timeline + Water + Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline de hoje */}
        <div className="clay-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-lg text-[#4a3f72]">Agenda de Hoje</h3>
            <a href="/agenda" className="clay-card px-4 py-1 text-xs font-bold text-gray-500 hover:text-[#9871F5] transition-colors">Ver Mais</a>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            {events.length === 0 && <p className="text-center text-gray-400 py-8 font-bold text-sm">Nada agendado hoje. 🌤️</p>}
            {events.map((e) => {
              const c = sourceColor(e.source);
              return (
                <div key={e.id} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${c.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="text-xs font-bold text-gray-400 w-12">{e.allDay ? 'dia' : fmtTime(e.start)}</span>
                  <span className={`text-sm font-bold flex-1 ${c.text} truncate`}>{e.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hidratação */}
        <div className="clay-card p-6">
          <h3 className="font-extrabold text-lg text-[#4a3f72] mb-6">Hidratação</h3>
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-100" />
              </svg>
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                <circle cx="50%" cy="50%" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-sky-400" strokeDasharray="440" strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
              </svg>
              <div className="text-center">
                <span className="text-3xl font-extrabold text-[#4a3f72]">{waterPercent}%</span>
                <p className="text-xs text-gray-500 font-medium">{totalWater}/{WATER_GOAL}ml</p>
              </div>
            </div>
            <div className="mt-6 w-full"><WaterButtons /></div>
          </div>
        </div>

        {/* Foco do dia */}
        <div className="clay-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-lg text-[#4a3f72]">Foco do Dia</h3>
            <a href="/tarefas" className="text-[#9871F5] text-sm font-bold bg-[#e0d4fc]/50 px-3 py-1 rounded-full">Ver tudo</a>
          </div>
          <div className="space-y-2">
            {topTasks.map((task) => <TaskCheckbox key={task.id} task={task} />)}
            {topTasks.length === 0 && <p className="text-center text-gray-500 py-4 font-bold">Sem tarefas pendentes! 🎉</p>}
          </div>
        </div>
      </div>

      {/* Metas da semana */}
      {goals.length > 0 && (
        <div className="clay-card p-6">
          <h3 className="font-extrabold text-lg text-[#4a3f72] mb-4">Progresso das Metas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.slice(0, 4).map((g) => {
              const pct = g.target ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-sm font-bold text-gray-600 mb-1">
                    <span>{g.title}</span><span>{pct}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#9871F5] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
