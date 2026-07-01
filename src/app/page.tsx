import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import TaskCheckbox from '@/components/TaskCheckbox';
import WaterButtons from '@/components/WaterButtons';
import ModIcon from '@/components/ModIcon';
import BalanceDisplay from '@/components/BalanceDisplay';
import { fmtTime, sourceColor } from '@/lib/calendar';
import { startOfDay, endOfDay, startOfMonth } from 'date-fns';
import { kcalTrend, waterTrend, taskTrend, eventTrend } from '@/lib/weekTrend';
import TrendArea from '@/components/charts/TrendArea';
import SparkLine from '@/components/charts/SparkLine';
import DonutRing from '@/components/charts/DonutRing';
import { MessageCircle, Bell, Plug, Sun } from 'lucide-react';

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
  const topTasks = pendingTasks.slice(0, 4);
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
    : 'Aproveite o dia livre!';

  const heroData = kcalW.map((p) => ({ label: p.label, value: p.value, target: user.targetKcal ?? undefined }));

  return (
    /* Mobile: flex-col normal (rola). Desktop: h-full fixo sem scroll */
    <div className="flex flex-col gap-3 page-enter md:h-full md:gap-2">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex justify-between items-center pt-1 px-1">
        <div>
          <h1 className="text-xl font-black leading-tight" style={{ color: 'var(--text-strong)' }}>
            Vitalis <span style={{ color: 'var(--brand-500)' }}>Hub</span>
          </h1>
          <p className="text-[11px] font-bold" style={{ color: 'var(--text-soft)' }}>Seu painel de vida</p>
        </div>
        <div className="flex gap-2">
          <a href="/social" className="w-8 h-8 rounded-xl flex items-center justify-center relative transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#B020C8,#D946EF)', boxShadow: '0 2px 8px rgba(0,0,0,0.13)' }}>
            <MessageCircle size={15} color="white" strokeWidth={2.2} />
          </a>
          <a href="/notificacoes" className="w-8 h-8 rounded-xl flex items-center justify-center relative transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#D94060,#FB7185)', boxShadow: '0 2px 8px rgba(0,0,0,0.13)' }}>
            <Bell size={15} color="white" strokeWidth={2.2} />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: '#D94060', border: '1.5px solid white' }}>
                {alertCount}
              </span>
            )}
          </a>
          <a href="/conexoes" className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#475569,#64748B)', boxShadow: '0 2px 8px rgba(0,0,0,0.13)' }}>
            <Plug size={15} color="white" strokeWidth={2.2} />
          </a>
        </div>
      </header>

      {/* ── Linha 2: Hero + Stats ─────────────────────────────────────
          Mobile:  hero full-width → stats em grid 2 cols
          Desktop: hero 40% + stats 5 cols lado-a-lado, 38% da altura  */}
      <div className="flex flex-col gap-3 md:flex-row md:gap-2 md:min-h-0 md:flex-[0_0_38%]">

        {/* Hero card */}
        <div className="hero-gradient p-4 overflow-hidden relative flex flex-col justify-between rounded-3xl md:flex-[0_0_40%]"
          style={{ minHeight: 160 }}>
          <div className="flex justify-between items-start z-10 relative">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-white/80 text-[11px] font-bold">Bom dia,</p>
              <h2 className="text-lg font-black text-white truncate flex items-center gap-1.5">
                {user.name} <Sun size={16} strokeWidth={2} className="text-yellow-200 flex-shrink-0" />
              </h2>
              <p className="text-white/90 text-xs font-medium mt-0.5 truncate">{nextAction}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white/75 text-[9px] font-black uppercase tracking-wider">Kcal semana</p>
              <p className="text-2xl font-black text-white">{kcalW.reduce((a, p) => a + p.value, 0)}</p>
              {user.targetKcal && (
                <p className="text-white/80 text-[10px] font-bold">meta {user.targetKcal}/dia</p>
              )}
            </div>
          </div>
          <div className="-mx-1 mt-1">
            <TrendArea data={heroData} color="rgba(255,255,255,0.9)"
              secondColor={user.targetKcal ? 'rgba(255,255,255,0.35)' : undefined}
              height={72} tickColor="rgba(255,255,255,0.60)" />
          </div>
          <div className="absolute right-[-10%] top-[-40%] w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-[-5%] bottom-[-30%] w-36 h-36 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 5 stat cards — mobile: 2 colunas / desktop: 5 colunas */}
        <div className="grid grid-cols-2 gap-2 md:flex-1 md:grid-cols-5 md:min-w-0">

          <div className="clay-card p-3 flex flex-col justify-between overflow-hidden"
            style={{ borderTop: '3px solid var(--mod-financas)' }}>
            <div className="flex items-center justify-between">
              <ModIcon mod="financas" size="sm" />
              {overBudget.length > 0 && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: '#FFE5E9', color: 'var(--mod-notif-strong)' }}>⚠️</span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>Saldo</p>
              <BalanceDisplay balance={totalBalance} size="small" variant="light" />
            </div>
            <div className="-mx-1">
              <SparkLine data={[totalBalance * 0.9, totalBalance * 0.95, totalBalance * 0.92, totalBalance * 0.98, totalBalance * 0.96, totalBalance * 0.99, totalBalance]}
                color="var(--mod-financas)" height={28} />
            </div>
          </div>

          <div className="clay-card p-3 flex flex-col justify-between overflow-hidden"
            style={{ borderTop: '3px solid var(--mod-agenda)' }}>
            <ModIcon mod="agenda" size="sm" />
            <div>
              <p className="text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>Eventos hoje</p>
              <p className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>{events.length}</p>
            </div>
            <div className="-mx-1"><SparkLine data={eventW.map((p) => p.value)} color="var(--mod-agenda)" height={28} /></div>
          </div>

          <div className="clay-card p-3 flex flex-col justify-between overflow-hidden"
            style={{ borderTop: '3px solid var(--mod-tarefas)' }}>
            <ModIcon mod="tarefas" size="sm" />
            <div>
              <p className="text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>Pendentes</p>
              <p className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>{pendingTasks.length}</p>
            </div>
            <div className="-mx-1"><SparkLine data={taskW.map((p) => p.value)} color="var(--mod-tarefas)" height={28} /></div>
          </div>

          <div className="clay-card p-3 flex flex-col justify-between overflow-hidden"
            style={{ borderTop: '3px solid var(--mod-agua)' }}>
            <ModIcon mod="agua" size="sm" />
            <div>
              <p className="text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>Água hoje</p>
              <p className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>{totalWater}ml</p>
            </div>
            <div className="-mx-1"><SparkLine data={waterW.map((p) => p.value)} color="var(--mod-agua)" height={28} /></div>
          </div>

          <div className="clay-card p-3 flex flex-col justify-between overflow-hidden col-span-2 md:col-span-1"
            style={{ borderTop: '3px solid var(--mod-dieta)' }}>
            <ModIcon mod="dieta" size="sm" />
            <div>
              <p className="text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>Refeições</p>
              <p className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>{meals.length}</p>
              <p className="text-[10px] font-bold" style={{ color: 'var(--mod-dieta)' }}>{calories} kcal · {protein}g</p>
            </div>
            <div className="-mx-1"><SparkLine data={kcalW.map((p) => p.value)} color="var(--mod-dieta)" height={28} /></div>
          </div>

        </div>
      </div>

      {/* ── Linha 3: Painéis ──────────────────────────────────────────
          Mobile:  cada painel em largura total, empilhados
          Desktop: 3 painéis lado-a-lado, preenche o restante         */}
      <div className="flex flex-col gap-3 md:flex-row md:gap-2 md:flex-1 md:min-h-0">

        {/* Agenda */}
        <div className="clay-card flex flex-col p-4 overflow-hidden md:flex-1 md:min-w-0"
          style={{ minHeight: 240 }}>
          <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <ModIcon mod="agenda" size="sm" />
              <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-strong)' }}>Agenda de Hoje</h3>
            </div>
            <a href="/agenda" className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--mod-agenda-bg)', color: 'var(--mod-agenda-strong)' }}>Ver mais</a>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5">
            {events.length === 0 && (
              <p className="text-center py-6 font-bold text-xs" style={{ color: 'var(--text-soft)' }}>
                Nada agendado hoje.
              </p>
            )}
            {events.map((e) => {
              const c = sourceColor(e.source);
              return (
                <div key={e.id} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${c.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  <span className="text-[10px] font-bold w-10 flex-shrink-0" style={{ color: 'var(--clay-text-mute)' }}>
                    {e.allDay ? 'dia' : fmtTime(e.start)}
                  </span>
                  <span className={`text-xs font-bold flex-1 ${c.text} truncate`}>{e.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hidratação — mobile: full width / desktop: 200px fixo */}
        <div className="clay-card flex flex-col items-center p-4 overflow-hidden md:flex-shrink-0 md:w-[200px]">
          <div className="flex justify-between items-center w-full mb-2 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <ModIcon mod="agua" size="sm" />
              <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-strong)' }}>Hidro</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--mod-agua-bg)', color: 'var(--mod-agua-strong)' }}>
              {waterPercent}%
            </span>
          </div>
          <div className="flex items-center justify-center py-4 md:flex-1 md:py-0">
            <DonutRing percent={waterPercent} color="var(--mod-agua)"
              size={120} strokeWidth={12} label={`${totalWater}ml`} sublabel={`meta ${WATER_GOAL}ml`} />
          </div>
          <div className="mt-2 w-full flex-shrink-0"><WaterButtons /></div>
        </div>

        {/* Foco + Metas */}
        <div className="clay-card flex flex-col p-4 overflow-hidden md:flex-1 md:min-w-0"
          style={{ minHeight: 240 }}>
          <div className="flex justify-between items-center mb-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <ModIcon mod="tarefas" size="sm" />
              <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-strong)' }}>Foco do Dia</h3>
            </div>
            <a href="/tarefas" className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--mod-tarefas-bg)', color: 'var(--mod-tarefas-strong)' }}>Ver tudo</a>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5">
            {topTasks.map((task) => <TaskCheckbox key={task.id} task={task} />)}
            {topTasks.length === 0 && (
              <p className="text-center py-4 font-bold text-xs" style={{ color: 'var(--text-soft)' }}>
                Sem tarefas pendentes! 🎉
              </p>
            )}
            {goals.length > 0 && (
              <>
                <div className="flex items-center gap-1.5 pt-2 pb-1 flex-shrink-0">
                  <ModIcon mod="metas" size="sm" />
                  <span className="text-[10px] font-black" style={{ color: 'var(--text-soft)' }}>METAS</span>
                </div>
                {goals.slice(0, 3).map((g) => {
                  const pct = g.target ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
                  return (
                    <div key={g.id} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>
                        <span className="truncate">{g.title}</span>
                        <span style={{ color: 'var(--mod-metas)', flexShrink: 0, marginLeft: 4 }}>{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--mod-metas-bg)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--mod-metas)' }} />
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
