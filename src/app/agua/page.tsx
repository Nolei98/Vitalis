import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import WaterButtons from '@/components/WaterButtons';
import WaterReminder from '@/components/WaterReminder';
import DonutRing from '@/components/charts/DonutRing';
import PageFrame from '@/components/PageFrame';
import ModIcon from '@/components/ModIcon';
import { Droplet, Droplets } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AguaPage() {
  const user = await getCurrentUser();
  const waterLogs = await prisma.waterLog.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalWater = waterLogs.reduce((acc, log) => acc + log.amount, 0);
  const goal = 2000;
  const percent = Math.min(Math.round((totalWater / goal) * 100), 100);

  return (
    <PageFrame>
      <header className="flex-shrink-0 flex items-center gap-3 pt-2">
        <ModIcon mod="agua" size="lg" />
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Hidro</h1>
          <p className="text-sm font-bold" style={{ color: 'var(--mod-agua)' }}>Acompanhe sua ingestão de água</p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progresso + botões */}
        <div className="clay-card p-8 flex flex-col items-center justify-center gap-6">
          <DonutRing
            percent={percent}
            color="var(--mod-agua)"
            size={220}
            strokeWidth={20}
            label={`${percent}%`}
            sublabel={`${totalWater} / ${goal}ml`}
          />
          <div className="w-full">
            <p className="text-center text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-soft)' }}>
              Registro Rápido
            </p>
            <WaterButtons />
          </div>
        </div>

        {/* Histórico */}
        <div className="clay-card p-6 flex flex-col" style={{ maxHeight: 520 }}>
          <h2 className="text-lg font-extrabold mb-4" style={{ color: 'var(--text-strong)' }}>Histórico de Hoje</h2>
          <div className="space-y-3 overflow-y-auto flex-1 no-scrollbar">
            {waterLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 px-4 py-3 rounded-2xl"
                style={{ background: 'var(--mod-agua-bg)' }}>
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
                    {log.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min((log.amount / 500) * 100, 100)}%`, background: 'var(--mod-agua)' }} />
                </div>
              </div>
            ))}
            {waterLogs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40" style={{ color: 'var(--text-soft)' }}>
                <span className="text-4xl mb-3">🌵</span>
                <p className="font-bold">Nenhum registro ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Lembretes */}
        <div className="lg:col-span-2">
          <WaterReminder
            initialWakeTime={user.wakeTime}
            initialInterval={user.waterReminderInterval}
            initialEnabled={user.waterReminderEnabled}
            goal={goal}
          />
        </div>
      </div>
      </div>
    </PageFrame>
  );
}
