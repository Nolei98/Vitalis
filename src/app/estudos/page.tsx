import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import PageFrame from '@/components/PageFrame';
import ModIcon from '@/components/ModIcon';
import PomodoroTimer from '@/components/study/PomodoroTimer';
import {
  getStudySettings, listSubjects, getStudyReport,
  startSessionAction, upsertStudySettings, createSubject,
} from '@/app/actions/study';
import { dayRangeInTimezone, daysAgoInTimezone, startOfWeekInTimezone, startOfMonthInTimezone } from '@/lib/timezone';
import { BookOpen, Clock, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function fmtDuration(seconds: number): string {
  const totalMin = Math.round(seconds / 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${m}min`;
}

const SOURCE_EMOJI: Record<string, string> = { Agenda: '📅', Tarefa: '✅', Meta: '🎯', Manual: '📖' };
const SOURCE_TYPE_EMOJI: Record<string, string> = { calendar: '📅', task: '✅', goal: '🎯', manual: '📖' };

export default async function EstudosPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: sessionIdParam } = await searchParams;
  const user = await getCurrentUser();
  const [settings, subjects] = await Promise.all([getStudySettings(), listSubjects()]);

  let activeSession = sessionIdParam
    ? await prisma.studySession.findFirst({
        where: { id: sessionIdParam, userId: user.id, status: { in: ['running', 'paused'] } },
        include: { subject: true },
      })
    : null;
  if (!activeSession) {
    activeSession = await prisma.studySession.findFirst({
      where: { userId: user.id, status: { in: ['running', 'paused'] } },
      orderBy: { startedAt: 'desc' },
      include: { subject: true },
    });
  }

  const now = new Date();
  const report = await getStudyReport(daysAgoInTimezone(user.timezone, 29), now);
  const { start: todayStart } = dayRangeInTimezone(user.timezone);
  const weekStart = startOfWeekInTimezone(user.timezone);
  const monthStart = startOfMonthInTimezone(user.timezone);
  const sumSince = (d: Date) => report.sessions.filter((s) => s.startedAt >= d).reduce((a, s) => a + s.focusSeconds, 0);
  const todaySec = sumSince(todayStart);
  const weekSec = sumSince(weekStart);
  const monthSec = sumSince(monthStart);

  const maxSubject = Math.max(...report.bySubject.map((s) => s.seconds), 1);
  const maxSource = Math.max(...report.bySource.map((s) => s.seconds), 1);

  return (
    <PageFrame>
      <header className="flex-shrink-0 flex items-center gap-3 pt-2">
        <ModIcon mod="estudos" size="lg" />
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Estudos</h1>
          <p className="text-sm font-bold" style={{ color: 'var(--mod-estudos)' }}>Cronômetro, Pomodoro e relatório de tempo</p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timer / iniciar sessão */}
          <div className="lg:col-span-1 space-y-4">
            {activeSession ? (
              <PomodoroTimer
                session={{
                  id: activeSession.id,
                  label: activeSession.label,
                  subjectName: activeSession.subject?.name ?? null,
                  sourceType: activeSession.sourceType,
                  status: activeSession.status,
                  focusSeconds: activeSession.focusSeconds,
                  breakSeconds: activeSession.breakSeconds,
                  completedCycles: activeSession.completedCycles,
                  workMin: activeSession.workMin,
                  shortBreakMin: activeSession.shortBreakMin,
                  longBreakMin: activeSession.longBreakMin,
                  cyclesPerLong: activeSession.cyclesPerLong,
                }}
                soundOn={settings.soundOn}
                autoStartBreak={settings.autoStartBreak}
                autoStartWork={settings.autoStartWork}
              />
            ) : (
              <form action={startSessionAction} className="clay-card p-6 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={16} strokeWidth={2.2} style={{ color: 'var(--mod-estudos)' }} />
                  <h2 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Iniciar estudo</h2>
                </div>
                <input type="hidden" name="sourceType" value="manual" />
                {subjects.length > 0 && (
                  <select name="subjectId" className="clay-card w-full px-4 py-2 text-sm outline-none border-none">
                    <option value="">Sem matéria específica</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}
                <input
                  name="label"
                  placeholder="Ou digite a atividade (ex: Cálculo II)"
                  className="clay-card w-full px-4 py-2 text-sm outline-none border-none"
                />
                <button className="clay-btn w-full font-extrabold py-2.5 text-white" style={{ background: 'var(--mod-estudos)' }}>
                  Começar Pomodoro ({settings.workMin}min foco / {settings.shortBreakMin}min pausa)
                </button>
              </form>
            )}

            <form action={createSubject} className="clay-card p-5 space-y-2">
              <h2 className="text-sm font-extrabold" style={{ color: 'var(--text-strong)' }}>Nova matéria</h2>
              <input name="name" placeholder="Ex: Cálculo II" required
                className="clay-card w-full px-4 py-2 text-sm outline-none border-none" />
              <button className="clay-btn w-full font-bold py-2 text-sm text-white" style={{ background: 'var(--mod-estudos)' }}>
                Adicionar +
              </button>
            </form>

            <form action={upsertStudySettings} className="clay-card p-5 space-y-3">
              <h2 className="text-sm font-extrabold" style={{ color: 'var(--text-strong)' }}>Regras do Pomodoro</h2>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-bold text-gray-500">
                  Foco (min)
                  <input name="workMin" type="number" min={1} defaultValue={settings.workMin}
                    className="clay-card w-full px-3 py-1.5 text-sm outline-none border-none mt-1" />
                </label>
                <label className="text-xs font-bold text-gray-500">
                  Pausa curta (min)
                  <input name="shortBreakMin" type="number" min={1} defaultValue={settings.shortBreakMin}
                    className="clay-card w-full px-3 py-1.5 text-sm outline-none border-none mt-1" />
                </label>
                <label className="text-xs font-bold text-gray-500">
                  Pausa longa (min)
                  <input name="longBreakMin" type="number" min={1} defaultValue={settings.longBreakMin}
                    className="clay-card w-full px-3 py-1.5 text-sm outline-none border-none mt-1" />
                </label>
                <label className="text-xs font-bold text-gray-500">
                  Ciclos p/ pausa longa
                  <input name="cyclesPerLong" type="number" min={1} defaultValue={settings.cyclesPerLong}
                    className="clay-card w-full px-3 py-1.5 text-sm outline-none border-none mt-1" />
                </label>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input type="checkbox" name="autoStartBreak" defaultChecked={settings.autoStartBreak} /> Iniciar pausa automaticamente
              </label>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input type="checkbox" name="autoStartWork" defaultChecked={settings.autoStartWork} /> Retomar foco automaticamente
              </label>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input type="checkbox" name="soundOn" defaultChecked={settings.soundOn} /> Som ao trocar de bloco
              </label>
              <button className="clay-btn w-full font-bold py-2 text-sm text-white" style={{ background: 'var(--mod-estudos)' }}>
                Salvar regras
              </button>
            </form>
          </div>

          {/* Relatório */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[{ label: 'Hoje', v: todaySec }, { label: 'Semana', v: weekSec }, { label: 'Mês', v: monthSec }].map((c) => (
                <div key={c.label} className="clay-card p-4 text-center" style={{ borderTop: '3px solid var(--mod-estudos)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-soft)' }}>{c.label}</p>
                  <p className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>{fmtDuration(c.v)}</p>
                </div>
              ))}
            </div>

            <div className="clay-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} strokeWidth={2.2} style={{ color: 'var(--mod-estudos)' }} />
                <h2 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Por matéria (últimos 30 dias)</h2>
              </div>
              {report.bySubject.length === 0 && (
                <p className="text-center py-4 font-bold text-sm" style={{ color: 'var(--text-soft)' }}>Sem sessões ainda.</p>
              )}
              {report.bySubject.map((s) => (
                <div key={s.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold" style={{ color: 'var(--text-soft)' }}>
                    <span className="truncate">{s.name}</span>
                    <span style={{ color: 'var(--mod-estudos)' }}>{fmtDuration(s.seconds)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--mod-estudos-bg)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(s.seconds / maxSubject) * 100}%`, background: 'var(--mod-estudos)' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="clay-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Clock size={16} strokeWidth={2.2} style={{ color: 'var(--mod-estudos)' }} />
                <h2 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Por origem</h2>
              </div>
              {report.bySource.map((s) => (
                <div key={s.source} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold" style={{ color: 'var(--text-soft)' }}>
                    <span>{SOURCE_EMOJI[s.source] ?? '📖'} {s.source}</span>
                    <span style={{ color: 'var(--mod-estudos)' }}>{fmtDuration(s.seconds)}</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--mod-estudos-bg)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(s.seconds / maxSource) * 100}%`, background: 'var(--mod-tarefas)' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="clay-card p-5 space-y-2">
              <h2 className="text-base font-extrabold mb-1" style={{ color: 'var(--text-strong)' }}>Sessões recentes</h2>
              {report.sessions.slice(0, 8).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'var(--mod-estudos-bg)' }}>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text-strong)' }}>
                      {s.subject?.name ?? s.label ?? 'Sessão'}
                    </p>
                    <p className="text-[11px] font-bold" style={{ color: 'var(--text-soft)' }}>
                      {s.startedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · {SOURCE_TYPE_EMOJI[s.sourceType] ?? '📖'} · {s.completedCycles} ciclo(s)
                    </p>
                  </div>
                  <span className="text-sm font-black shrink-0" style={{ color: 'var(--mod-estudos)' }}>{fmtDuration(s.focusSeconds)}</span>
                </div>
              ))}
              {report.sessions.length === 0 && (
                <p className="text-center py-4 font-bold text-sm" style={{ color: 'var(--text-soft)' }}>Nenhuma sessão registrada.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
