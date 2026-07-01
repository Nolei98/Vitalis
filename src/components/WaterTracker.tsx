'use client';

import { useOptimistic, useTransition } from 'react';
import { Droplet, Droplets } from 'lucide-react';
import { addWater } from '@/app/actions/water';
import DonutRing from '@/components/charts/DonutRing';

export interface WaterLogItem {
  id: string;
  amount: number;
  createdAt: string; // ISO
}

export default function WaterTracker({ logs, goal }: { logs: WaterLogItem[]; goal: number }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticLogs, addOptimisticLog] = useOptimistic(
    logs,
    (state, amount: number) => [
      { id: `optimistic-${Date.now()}`, amount, createdAt: new Date().toISOString() },
      ...state,
    ],
  );

  const total = optimisticLogs.reduce((a, l) => a + l.amount, 0);
  const percent = Math.min(Math.round((total / goal) * 100), 100);

  function add(amount: number) {
    startTransition(async () => {
      addOptimisticLog(amount);
      await addWater(amount);
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Progresso + botões */}
      <div className="clay-card p-8 flex flex-col items-center justify-center gap-6">
        <DonutRing
          percent={percent}
          color="var(--mod-agua)"
          size={220}
          strokeWidth={20}
          label={`${percent}%`}
          sublabel={`${total} / ${goal}ml`}
        />
        <div className="w-full">
          <p className="text-center text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-soft)' }}>
            Registro Rápido
          </p>
          <div className={`flex flex-col gap-1.5 w-full transition-opacity ${isPending ? 'opacity-70' : ''}`}>
            <button
              onClick={() => add(250)}
              className="clay-btn font-bold px-3 py-1.5 w-full flex items-center justify-center gap-2 text-xs transition-transform active:scale-95 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#1AA3CC,#36C5F0)', color: 'white', boxShadow: '0 2px 8px rgba(26,163,204,0.30)' }}
            >
              <Droplet size={14} strokeWidth={2.2} />
              <span>+ 250ml</span>
            </button>
            <button
              onClick={() => add(500)}
              className="clay-btn font-bold px-3 py-1.5 w-full flex items-center justify-center gap-2 text-xs transition-transform active:scale-95 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#0E7EA8,#1AA3CC)', color: 'white', boxShadow: '0 2px 8px rgba(14,126,168,0.30)' }}
            >
              <Droplets size={14} strokeWidth={2.2} />
              <span>+ 500ml</span>
            </button>
          </div>
        </div>
      </div>

      {/* Histórico */}
      <div className="clay-card p-6 flex flex-col" style={{ maxHeight: 520 }}>
        <h2 className="text-lg font-extrabold mb-4" style={{ color: 'var(--text-strong)' }}>Histórico de Hoje</h2>
        <div className="space-y-3 overflow-y-auto flex-1 no-scrollbar">
          {optimisticLogs.map((log) => (
            <div key={log.id} className="flex items-center gap-4 px-4 py-3 rounded-2xl transition-opacity"
              style={{ background: 'var(--mod-agua-bg)', opacity: log.id.startsWith('optimistic-') ? 0.6 : 1 }}>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: log.amount >= 500 ? 'linear-gradient(135deg,#0E7EA8,#1AA3CC)' : 'linear-gradient(135deg,#1AA3CC,#36C5F0)', boxShadow: '0 1px 6px rgba(0,0,0,0.12)' }}>
                {log.amount >= 500
                  ? <Droplets size={14} color="white" strokeWidth={2.2} />
                  : <Droplet size={14} color="white" strokeWidth={2.2} />
                }
              </span>
              <div className="flex-1">
                <p className="font-extrabold text-sm" style={{ color: 'var(--mod-agua-strong)' }}>+{log.amount}ml</p>
                <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>
                  {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min((log.amount / 500) * 100, 100)}%`, background: 'var(--mod-agua)' }} />
              </div>
            </div>
          ))}
          {optimisticLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40" style={{ color: 'var(--text-soft)' }}>
              <span className="text-4xl mb-3">🌵</span>
              <p className="font-bold">Nenhum registro ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
