'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { BellRing, Info } from 'lucide-react';
import { saveWaterReminder, getWaterStatus } from '@/app/actions/water';

interface Props {
  initialWakeTime: string | null;
  initialInterval: number | null;
  initialEnabled: boolean;
  goal: number;
}

const TIPS = [
  'Você perde ~500ml de água só dormindo (respiração e suor). Beba 300-500ml assim que acordar, antes até do café.',
  'Pouco e com frequência hidrata melhor que muito de uma vez: o corpo absorve bem cerca de 200-250ml por vez — o excedente vira só urina, sem hidratar direito.',
  'A sede já é sinal de desidratação leve (~1-2%), suficiente pra baixar foco e disposição. Lembrete evita depender só da sede.',
  'Evite concentrar a ingestão nas 2h antes de dormir — hidrata melhor distribuído ao longo do dia acordado e não atrapalha o sono.',
];

function suggestInterval(wakeTime: string, goal: number): number {
  const [h, m] = wakeTime.split(':').map(Number);
  const wakeMin = h * 60 + m;
  const sleepMin = 22 * 60; // considera janela acordado até 22h
  const awakeMin = Math.max(sleepMin - wakeMin, 60);
  const cups = Math.max(goal / 250, 1); // ~250ml por vez é a dose que o corpo absorve bem
  const raw = Math.min(Math.max(Math.round(awakeMin / cups), 30), 120);
  return Math.round(raw / 15) * 15; // encaixa nas opções do select (múltiplos de 15)
}

/** Beep curto e leve — fecha o AudioContext ao final pra não acumular recursos. */
function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.12;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
    osc.onended = () => void ctx.close();
  } catch {
    // ambiente sem Web Audio (ex.: SSR) — ignora
  }
}

export default function WaterReminder({ initialWakeTime, initialInterval, initialEnabled, goal }: Props) {
  const [wakeTime, setWakeTime] = useState(initialWakeTime ?? '07:00');
  const [intervalMin, setIntervalMin] = useState(initialInterval ?? suggestInterval(initialWakeTime ?? '07:00', goal));
  const [enabled, setEnabled] = useState(initialEnabled);
  const [systemNotif, setSystemNotif] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const lastSlotRef = useRef<number>(-1);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function save() {
    setSaved(false);
    startTransition(async () => {
      await saveWaterReminder({ wakeTime, intervalMin, enabled });
      setSaved(true);
    });
  }

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 6000);
  }

  async function fireReminder() {
    beep();
    const { total, goal: g } = await getWaterStatus();
    if (total >= g) return;
    const msg = `💧 Hora de se hidratar! Você está em ${total}/${g}ml hoje.`;
    showToast(msg);
    // Notificação do sistema é opcional (pode ser pesada/intrusiva) — só se o usuário pedir.
    if (systemNotif && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('💧 Hora de se hidratar!', {
        body: `Você está em ${total}/${g}ml hoje. Beba um copo d'água agora.`,
        silent: true,
      });
    }
  }

  function toggleSystemNotif(checked: boolean) {
    setSystemNotif(checked);
    if (checked && 'Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }

  useEffect(() => {
    if (!enabled || !wakeTime || !intervalMin) return;

    const [h, m] = wakeTime.split(':').map(Number);
    const wakeMin = h * 60 + m;
    const todayKey = () => new Date().toISOString().slice(0, 10);
    const storageKey = `water-reminder-slot-${todayKey()}`;
    lastSlotRef.current = Number(localStorage.getItem(storageKey) ?? -1);

    const tick = () => {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (nowMin < wakeMin) return;
      const slot = Math.floor((nowMin - wakeMin) / intervalMin);
      if (slot <= lastSlotRef.current) return;
      lastSlotRef.current = slot;
      localStorage.setItem(`water-reminder-slot-${todayKey()}`, String(slot));
      void fireReminder();
    };

    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, wakeTime, intervalMin]);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const suggested = suggestInterval(wakeTime, goal);

  return (
    <div className="clay-card p-6 space-y-4 relative">
      <div className="flex items-center gap-2">
        <BellRing size={18} strokeWidth={2.2} style={{ color: 'var(--mod-agua)' }} />
        <h2 className="text-lg font-extrabold" style={{ color: 'var(--text-strong)' }}>Lembrete de hidratação</h2>
      </div>

      {toast && (
        <div className="rounded-xl px-4 py-2.5 text-sm font-bold text-white" style={{ background: 'var(--mod-agua)' }}>
          {toast}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-500">Acordo às</label>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="clay-card w-full px-3 py-2 text-sm outline-none border-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1 text-gray-500">A cada</label>
          <select
            value={intervalMin}
            onChange={(e) => setIntervalMin(Number(e.target.value))}
            className="clay-card w-full px-3 py-2 text-sm outline-none border-none"
          >
            {[30, 45, 60, 75, 90, 105, 120].map((v) => (
              <option key={v} value={v}>{v} min{v === suggested ? ' (sugerido)' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Ativar lembretes (som + aviso na tela) enquanto o app estiver aberto
        </label>
        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-500">
          <input type="checkbox" checked={systemNotif} onChange={(e) => toggleSystemNotif(e.target.checked)} />
          Também notificar pelo sistema (Windows/navegador) — pode ser mais pesado
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={isPending}
          className="clay-btn font-bold py-2 px-5 text-sm text-white disabled:opacity-60"
          style={{ background: 'var(--mod-agua)' }}
        >
          {isPending ? 'Salvando…' : 'Salvar'}
        </button>
        <button
          onClick={fireReminder}
          type="button"
          className="clay-btn font-bold py-2 px-4 text-sm bg-white"
          style={{ color: 'var(--mod-agua)' }}
        >
          Testar agora
        </button>
        {saved && <span className="text-xs font-bold text-emerald-600">Salvo ✓</span>}
      </div>

      <p className="text-[11px] font-medium text-gray-400">
        Sugestão com base na sua meta ({goal}ml) e horário: a cada {suggested} min. Funciona só com o app/aba aberta no navegador.
      </p>

      <div className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--mod-agua-bg)' }}>
        <p className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--mod-agua-strong)' }}>
          <Info size={14} strokeWidth={2.2} /> Por que esse intervalo
        </p>
        <ul className="text-xs font-medium text-gray-600 space-y-1.5 list-disc list-inside">
          {TIPS.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
    </div>
  );
}
