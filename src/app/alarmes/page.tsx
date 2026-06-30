import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { createAlarm, deleteAlarm } from '@/app/actions/alarms';
import PageFrame from '@/components/PageFrame';

export const dynamic = 'force-dynamic';

const TYPE_EMOJI: Record<string, string> = {
  meal: '🥗', water: '💧', medicine: '💊', wakeup: '⏰', event: '📅', generic: '🔔',
};

export default async function AlarmesPage() {
  const user = await getCurrentUser();
  const alarms = await prisma.alarm.findMany({ where: { userId: user.id }, orderBy: { time: 'asc' } });

  return (
    <PageFrame>
      <header className="flex-shrink-0 flex items-center gap-3 pt-2">
        <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'var(--mod-alarmes-bg)' }}>⏰</span>
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Alarmes</h1>
          <p className="text-sm font-bold" style={{ color: 'var(--mod-alarmes)' }}>Disparos por app e Discord</p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 clay-card p-5 space-y-3">
          <h2 className="text-base font-extrabold mb-2" style={{ color: 'var(--text-strong)' }}>Seus alarmes</h2>
          {alarms.length === 0 && (
            <p className="text-center py-6 font-bold text-sm" style={{ color: 'var(--text-soft)' }}>Nenhum alarme.</p>
          )}
          {alarms.map((a) => (
            <div key={a.id} className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: 'var(--mod-alarmes-bg)' }}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{TYPE_EMOJI[a.type] ?? '🔔'}</span>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-strong)' }}>{a.label}</p>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>{a.recurrence} · {a.channels}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black" style={{ color: 'var(--mod-alarmes-strong)' }}>{a.time}</span>
                <form action={deleteAlarm}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-xs font-bold" style={{ color: '#FB7185' }}>✕</button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <form action={createAlarm} className="clay-card p-5 space-y-3 h-fit"
          style={{ borderTop: '3px solid var(--mod-alarmes)' }}>
          <h2 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Novo Alarme</h2>
          <input name="label" placeholder="Ex: Tomar remédio" required className="clay-card w-full px-4 py-2 text-sm outline-none" />
          <input name="time" type="time" required className="clay-card w-full px-4 py-2 text-sm outline-none" />
          <select name="type" className="clay-card w-full px-4 py-2 text-sm outline-none">
            <option value="generic">Geral</option>
            <option value="meal">Refeição</option>
            <option value="water">Água</option>
            <option value="medicine">Remédio</option>
            <option value="wakeup">Despertador</option>
          </select>
          <select name="recurrence" className="clay-card w-full px-4 py-2 text-sm outline-none">
            <option value="daily">Todos os dias</option>
            <option value="weekdays">Dias úteis</option>
            <option value="once">Uma vez</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
            <input type="checkbox" name="channels" value="app" defaultChecked /> App
          </label>
          <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
            <input type="checkbox" name="channels" value="discord" /> Discord
          </label>
          <button className="clay-btn w-full font-extrabold py-2.5 text-white"
            style={{ background: 'var(--mod-alarmes)' }}>Criar Alarme +</button>
        </form>
      </div>
      </div>
    </PageFrame>
  );
}
