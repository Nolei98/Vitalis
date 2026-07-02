'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Square, BookOpen } from 'lucide-react';
import { pauseSession, resumeSession, logCycle, completeSession, cancelSession } from '@/app/actions/study';

type Phase = 'work' | 'short' | 'long';

interface SessionData {
  id: string;
  label: string | null;
  subjectName: string | null;
  sourceType: string;
  status: string;
  focusSeconds: number;
  breakSeconds: number;
  completedCycles: number;
  workMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  cyclesPerLong: number;
}

const PHASE_LABEL: Record<Phase, string> = { work: 'Foco', short: 'Pausa curta', long: 'Pausa longa' };

function phaseMs(phase: Phase, s: SessionData): number {
  const min = phase === 'work' ? s.workMin : phase === 'short' ? s.shortBreakMin : s.longBreakMin;
  return min * 60_000;
}

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 660;
    gain.gain.value = 0.14;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    osc.onended = () => void ctx.close();
  } catch {
    // sem Web Audio — ignora
  }
}

function fmt(ms: number): string {
  const total = Math.max(Math.ceil(ms / 1000), 0);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface StoredState {
  phase: Phase;
  cyclesDone: number;
  phaseEndAt: number | null; // null quando pausado
  remainingMs: number;
}

interface Props {
  session: SessionData;
  soundOn: boolean;
  autoStartBreak: boolean;
  autoStartWork: boolean;
}

export default function PomodoroTimer({ session, soundOn, autoStartBreak, autoStartWork }: Props) {
  const router = useRouter();
  const storageKey = `study-timer-${session.id}`;

  const [phase, setPhase] = useState<Phase>('work');
  const [cyclesDone, setCyclesDone] = useState(session.completedCycles);
  const [running, setRunning] = useState(session.status === 'running');
  const [remainingMs, setRemainingMs] = useState(phaseMs('work', session));
  const [systemNotif, setSystemNotif] = useState(false);
  const phaseEndAtRef = useRef<number | null>(null);
  const focusAccumRef = useRef(0); // segundos de foco não persistidos ainda
  const breakAccumRef = useRef(0);
  const [, forceTick] = useState(0);

  // Restaura estado local (fase/tempo restante) se existir — sobrevive a reload da aba.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const st: StoredState = JSON.parse(raw);
        setPhase(st.phase);
        setCyclesDone(st.cyclesDone);
        if (st.phaseEndAt) {
          phaseEndAtRef.current = st.phaseEndAt;
          setRunning(true);
        } else {
          setRemainingMs(st.remainingMs);
          setRunning(false);
        }
      } else if (session.status === 'running') {
        phaseEndAtRef.current = Date.now() + phaseMs('work', session);
      }
    } catch {
      // localStorage indisponível — segue com estado padrão
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persistLocal(next: Partial<StoredState>) {
    const st: StoredState = {
      phase: next.phase ?? phase,
      cyclesDone: next.cyclesDone ?? cyclesDone,
      phaseEndAt: next.phaseEndAt !== undefined ? next.phaseEndAt : phaseEndAtRef.current,
      remainingMs: next.remainingMs ?? remainingMs,
    };
    try { localStorage.setItem(storageKey, JSON.stringify(st)); } catch { /* ignore */ }
  }

  function nextPhase(current: Phase, cycles: number): { phase: Phase; cycles: number } {
    if (current === 'work') {
      const done = cycles + 1;
      return done % session.cyclesPerLong === 0
        ? { phase: 'long', cycles: done }
        : { phase: 'short', cycles: done };
    }
    return { phase: 'work', cycles };
  }

  async function advancePhase() {
    if (soundOn) beep();
    if (systemNotif && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`⏰ ${PHASE_LABEL[phase]} concluída`, { body: 'Vitalis YPT', silent: true });
    }
    // credita o bloco que terminou
    if (phase === 'work') focusAccumRef.current += session.workMin * 60;
    else breakAccumRef.current += (phase === 'short' ? session.shortBreakMin : session.longBreakMin) * 60;

    const { phase: np, cycles } = nextPhase(phase, cyclesDone);
    setPhase(np);
    setCyclesDone(cycles);

    await logCycle(session.id, focusAccumRef.current, breakAccumRef.current, cycles);
    focusAccumRef.current = 0;
    breakAccumRef.current = 0;

    const autoStart = np === 'work' ? autoStartWork : autoStartBreak;
    if (autoStart) {
      phaseEndAtRef.current = Date.now() + phaseMs(np, session);
      setRunning(true);
      persistLocal({ phase: np, cyclesDone: cycles, phaseEndAt: phaseEndAtRef.current });
    } else {
      const ms = phaseMs(np, session);
      phaseEndAtRef.current = null;
      setRunning(false);
      setRemainingMs(ms);
      persistLocal({ phase: np, cyclesDone: cycles, phaseEndAt: null, remainingMs: ms });
    }
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (!phaseEndAtRef.current) return;
      const remaining = phaseEndAtRef.current - Date.now();
      if (remaining <= 0) {
        void advancePhase();
      } else {
        forceTick((t) => t + 1);
      }
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, cyclesDone]);

  // Recalcula ao voltar de aba em background (o setInterval é throttled, não o timestamp).
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') forceTick((t) => t + 1);
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const displayMs = running && phaseEndAtRef.current ? phaseEndAtRef.current - Date.now() : remainingMs;

  async function handlePauseResume() {
    if (running) {
      const remaining = phaseEndAtRef.current ? phaseEndAtRef.current - Date.now() : remainingMs;
      setRemainingMs(Math.max(remaining, 0));
      phaseEndAtRef.current = null;
      setRunning(false);
      const elapsedSec = Math.round((phaseMs(phase, session) - Math.max(remaining, 0)) / 1000);
      if (phase === 'work') focusAccumRef.current += elapsedSec;
      else breakAccumRef.current += elapsedSec;
      await pauseSession(session.id, focusAccumRef.current, breakAccumRef.current);
      focusAccumRef.current = 0;
      breakAccumRef.current = 0;
      persistLocal({ phaseEndAt: null, remainingMs: Math.max(remaining, 0) });
    } else {
      phaseEndAtRef.current = Date.now() + remainingMs;
      setRunning(true);
      await resumeSession(session.id);
      persistLocal({ phaseEndAt: phaseEndAtRef.current });
    }
  }

  async function handleStop() {
    const remaining = phaseEndAtRef.current ? phaseEndAtRef.current - Date.now() : remainingMs;
    const elapsedSec = Math.max(Math.round((phaseMs(phase, session) - Math.max(remaining, 0)) / 1000), 0);
    if (phase === 'work') focusAccumRef.current += elapsedSec;
    else breakAccumRef.current += elapsedSec;
    await completeSession(session.id, focusAccumRef.current, breakAccumRef.current, cyclesDone);
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    router.push('/estudos');
  }

  async function handleCancel() {
    await cancelSession(session.id);
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    router.push('/estudos');
  }

  function toggleSystemNotif(checked: boolean) {
    setSystemNotif(checked);
    if (checked && 'Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }

  const title = session.subjectName ?? session.label ?? 'Sessão de estudo';
  const phaseColor = phase === 'work' ? 'var(--mod-estudos)' : 'var(--mod-tarefas)';

  return (
    <div className="clay-card p-6 space-y-5 text-center">
      <div className="flex items-center justify-center gap-2">
        <BookOpen size={16} strokeWidth={2.2} style={{ color: 'var(--mod-estudos)' }} />
        <p className="font-extrabold text-sm truncate" style={{ color: 'var(--text-strong)' }}>{title}</p>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: phaseColor }}>
        {PHASE_LABEL[phase]} · ciclo {phase === 'work' ? (cyclesDone % session.cyclesPerLong) + 1 : cyclesDone}/{session.cyclesPerLong}
      </p>

      <p className="text-6xl font-black tabular-nums" style={{ color: 'var(--text-strong)' }}>
        {fmt(displayMs)}
      </p>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePauseResume}
          className="clay-btn font-bold py-2.5 px-6 text-sm text-white flex items-center gap-2"
          style={{ background: 'var(--mod-estudos)' }}
        >
          {running ? <><Pause size={15} strokeWidth={2.2} /> Pausar</> : <><Play size={15} strokeWidth={2.2} /> Continuar</>}
        </button>
        <button
          onClick={handleStop}
          className="clay-btn font-bold py-2.5 px-5 text-sm bg-white flex items-center gap-2"
          style={{ color: 'var(--mod-estudos)' }}
        >
          <Square size={14} strokeWidth={2.2} /> Concluir
        </button>
        <button onClick={handleCancel} className="text-xs font-bold" style={{ color: '#FB7185' }}>
          Cancelar
        </button>
      </div>

      <label className="flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer text-gray-500">
        <input type="checkbox" checked={systemNotif} onChange={(e) => toggleSystemNotif(e.target.checked)} />
        Notificar pelo sistema ao fim de cada bloco (opcional)
      </label>

      {!soundOn && (
        <p className="text-[11px] font-medium text-gray-400">Som desativado nas configurações de estudo.</p>
      )}
    </div>
  );
}
