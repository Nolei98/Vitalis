import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import TaskCheckbox from '@/components/TaskCheckbox';
import WaterButtons from '@/components/WaterButtons';
import BalanceDisplay from '@/components/BalanceDisplay';
import { fmtTime, sourceColor } from '@/lib/calendar';
import { startOfDay, endOfDay, startOfMonth } from 'date-fns';
import { kcalTrend, waterTrend, taskTrend, eventTrend } from '@/lib/weekTrend';
import TrendArea from '@/components/charts/TrendArea';
import SparkLine from '@/components/charts/SparkLine';
import DonutRing from '@/components/charts/DonutRing';

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

  const [kcalW, waterW, taskW, eventW] = await Promise.all([
    kcalTrend(user.id),
    waterTrend(user.id),
    taskTrend(user.id),
    eventTrend(user.id),
  ]);

  const totalWater = waterLogs.reduce((a, l) => a + l.amount, 0);
  const waterPercent = Math.min(Math.round((totalWater / WATER_GOAL) * 100), 100);
  const topTasks = pendingTasks.slice(0, 3);
  const totalBalance = finAccounts.reduce((a, acc) => a + acc.balance, 0);
  const calories = meals.reduce((a, m) => a + (m.calories ?? 0), 0);
  const protein = meals.reduce((a, m) => a + (m.protein ?? 0), 0);

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

  const heroData = kcalW.map((p, i) => ({
    label: p.label,
    value: p.value,
    target: user.targetKcal ?? undefined,
  }));

  return (
    <div className="space-y-6 pb-8 page-enter">
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-3xl font-black" style={{ color: 'var(--text-strong)' }}>
            Vitalis <span style={{ color: 'var(--brand-500)' }}>Hub</span>
          </h1>
          <p className="text-sm font-bold" style={{ color: 'var(--text-soft)' }}>Seu painel de vida</p>
        </div>
        <div className="flex gap-3">
          <a href="/social" className="clay-card w-10 h-10 flex items-center justify-center relative group"
            title="Mensagens e Social">
            <span>💬</span>
          </a>
          <a href="/notificacoes" className="clay-card w-10 h-10 flex items-center justify-center relative">
            <span>🔔</span>
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: 'var(--mod-notif)' }}>
                {alertCount}
              </span>
            )}
          </a>
          <a href="/conexoes" className="clay-card w-10 h-10 flex items-center justify-center">🔌</a>
        </div>
      </header>

      {/* Hero card — gradiente + AreaChart */}
      <div className="hero-gradient p-6 text-white overflow-hidden relative">
        <div className="flex justify-between items-start mb-4 z-10 relative">
          <div>
            <p className="text-white/70 text-sm font-bold mb-0.5">Bom dia</p>
            <h2 className="text-2xl font-black">{user.name} ☀️</h2>
            <p className="text-white/80 text-sm font-medium mt-1 max-w-[220px]">{nextAction}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-wider">Kcal semana</p>
            <p className="text-3xl font-black">{kcalW.reduce((a, p) => a + p.value, 0)}</p>
            {user.targetKcal && (
              <p className="text-white/70 text-xs font-bold">meta {user.targetKcal}/dia</p>
            )}
          </div>
        </div>

        <div className="-mx-1">
          <TrendArea
            data={heroData}
            color="rgba(255,255,255,0.9)"
            secondColor={user.targetKcal ? 'rgba(255,255,255,0.35)' : undefined}
            height={110}
          />
        </div>

        <div className="absolute right-[-10%] top-[-40%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-[-5%] bottom-[-30%] w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Stat cards com sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Saldo */}
        <div className="clay-card p-4 flex flex-col" style={{ borderTop: '3px solid var(--mod-financas)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg"
              style={{ background: 'var(--mod-financas-bg)' }}>💰</span>
            {overBudget.length > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: '#FFE5E9', color: 'var(--mod-notif-strong)' }}>
                ⚠️ {overBudget.length}
              </span>
            )}
          </div>
          <p className="text-[11px] font-bold mb-0.5" style={{ color: 'var(--text-soft)' }}>Saldo Atual</p>
          <BalanceDisplay balance={totalBalance} size="small" />
          <div className="mt-2 -mx-1">
            <SparkLine data={[totalBalance * 0.9, totalBalance * 0.95, totalBalance * 0.92, totalBalance * 0.98, totalBalance * 0.96, totalBalance * 0.99, totalBalance]} color="var(--mod-financas)" height={32} />
          </div>
        </div>

        {/* Eventos */}
        <div className="clay-card p-4 flex flex-col" style={{ borderTop: '3px solid var(--mod-agenda)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg"
              style={{ background: 'var(--mod-agenda-bg)' }}>📅</span>
          </div>
          <p className="text-[11px] font-bold mb-0.5" style={{ color: 'var(--text-soft)' }}>Eventos Hoje</p>
          <p className="text-3xl font-black" style={{ color: 'var(--text-strong)' }}>{events.length}</p>
          <div className="mt-2 -mx-1">
            <SparkLine data={eventW.map((p) => p.value)} color="var(--mod-agenda)" height={32} />
          </div>
        </div>

        {/* Tarefas */}
        <div className="clay-card p-4 flex flex-col" style={{ borderTop: '3px solid var(--mod-tarefas)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg"
              style={{ background: 'var(--mod-tarefas-bg)' }}>✅</span>
          </div>
          <p className="text-[11px] font-bold mb-0.5" style={{ color: 'var(--text-soft)' }}>Pendentes</p>
          <p className="text-3xl font-black" style={{ color: 'var(--text-strong)' }}>{pendingTasks.length}</p>
          <div className="mt-2 -mx-1">
            <SparkLine data={taskW.map((p) => p.value)} color="var(--mod-tarefas)" height={32} />
          </div>
        </div>

        {/* Água */}
        <div className="clay-card p-4 flex flex-col" style={{ borderTop: '3px solid var(--mod-agua)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg"
              style={{ background: 'var(--mod-agua-bg)' }}>💧</span>
          </div>
          <p className="text-[11px] font-bold mb-0.5" style={{ color: 'var(--text-soft)' }}>Água Hoje</p>
          <p className="text-3xl font-black" style={{ color: 'var(--text-strong)' }}>{totalWater}ml</p>
          <div className="mt-2 -mx-1">
            <SparkLine data={waterW.map((p) => p.value)} color="var(--mod-agua)" height={32} />
          </div>
        </div>

        {/* Refeições */}
        <div className="clay-card p-4 flex flex-col" style={{ borderTop: '3px solid var(--mod-dieta)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg"
              style={{ background: 'var(--mod-dieta-bg)' }}>🥗</span>
          </div>
          <p className="text-[11px] font-bold mb-0.5" style={{ color: 'var(--text-soft)' }}>Refeições</p>
          <p className="text-3xl font-black" style={{ color: 'var(--text-strong)' }}>{meals.length}</p>
          <p className="text-[11px] font-bold mt-0.5" style={{ color: 'var(--mod-dieta)' }}>
            {user.targetKcal ? `${calories}/${user.targetKcal} kcal` : `${calories} kcal · ${protein}g prot`}
          </p>
          <div className="mt-1 -mx-1">
            <SparkLine data={kcalW.map((p) => p.value)} color="var(--mod-dieta)" height={32} />
          </div>
        </div>
      </div>

      {/* Painéis: Agenda / Hidratação / Foco */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda de hoje */}
        <div className="clay-card p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ background: 'var(--mod-agenda-bg)', color: 'var(--mod-agenda-strong)' }}>📅</span>
              <h3 className="font-extrabold text-base" style={{ color: 'var(--text-strong)' }}>Agenda de Hoje</h3>
            </div>
            <a href="/agenda" className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'var(--mod-agenda-bg)', color: 'var(--mod-agenda-strong)' }}>Ver mais</a>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
            {events.length === 0 && (
              <p className="text-center py-8 font-bold text-sm" style={{ color: 'var(--text-soft)' }}>
                Nada agendado hoje. 🌤️
              </p>
            )}
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

        {/* Hidratação — DonutRing */}
        <div className="clay-card p-5 flex flex-col items-center">
          <div className="flex justify-between items-center w-full mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ background: 'var(--mod-agua-bg)' }}>💧</span>
              <h3 className="font-extrabold text-base" style={{ color: 'var(--text-strong)' }}>Hidratação</h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'var(--mod-agua-bg)', color: 'var(--mod-agua-strong)' }}>
              {waterPercent}%
            </span>
          </div>
          <DonutRing
            percent={waterPercent}
            color="var(--mod-agua)"
            size={148}
            strokeWidth={14}
            label={`${totalWater}ml`}
            sublabel={`meta ${WATER_GOAL}ml`}
          />
          <div className="mt-4 w-full"><WaterButtons /></div>
        </div>

        {/* Foco do dia */}
        <div className="clay-card p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ background: 'var(--mod-tarefas-bg)' }}>✅</span>
              <h3 className="font-extrabold text-base" style={{ color: 'var(--text-strong)' }}>Foco do Dia</h3>
            </div>
            <a href="/tarefas" className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'var(--mod-tarefas-bg)', color: 'var(--mod-tarefas-strong)' }}>Ver tudo</a>
          </div>
          <div className="space-y-2">
            {topTasks.map((task) => <TaskCheckbox key={task.id} task={task} />)}
            {topTasks.length === 0 && (
              <p className="text-center py-4 font-bold text-sm" style={{ color: 'var(--text-soft)' }}>
                Sem tarefas pendentes! 🎉
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Metas ativas */}
      {goals.length > 0 && (
        <div className="clay-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: 'var(--mod-metas-bg)' }}>🎯</span>
            <h3 className="font-extrabold text-base" style={{ color: 'var(--text-strong)' }}>Progresso das Metas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.slice(0, 4).map((g) => {
              const pct = g.target ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
              return (
                <div key={g.id}>
                  <div className="flex justify-between text-sm font-bold mb-1.5"
                    style={{ color: 'var(--text-soft)' }}>
                    <span>{g.title}</span>
                    <span style={{ color: 'var(--mod-metas)' }}>{pct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--mod-metas-bg)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: 'var(--mod-metas)' }}
                    />
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
