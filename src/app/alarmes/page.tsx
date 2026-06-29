import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { createAlarm, deleteAlarm } from '@/app/actions/alarms';

export const dynamic = 'force-dynamic';

const TYPE_EMOJI: Record<string, string> = {
  meal: '🥗', water: '💧', medicine: '💊', wakeup: '⏰', event: '📅', generic: '🔔',
};

export default async function AlarmesPage() {
  const user = await getCurrentUser();
  const alarms = await prisma.alarm.findMany({ where: { userId: user.id }, orderBy: { time: 'asc' } });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
      <header>
        <h1 className="text-4xl font-extrabold text-[#4a3f72]">Vitalis <span className="text-[#9871F5]">Alarmes</span></h1>
        <p className="text-gray-500 font-bold">Disparos por app e Discord</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 clay-card p-6 space-y-3">
          <h2 className="text-xl font-bold text-[#4a3f72]">Seus alarmes</h2>
          {alarms.length === 0 && <p className="text-gray-400 font-bold text-center py-6">Nenhum alarme.</p>}
          {alarms.map((a) => (
            <div key={a.id} className="flex items-center justify-between border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{TYPE_EMOJI[a.type] ?? '🔔'}</span>
                <div>
                  <p className="font-bold text-gray-700">{a.label}</p>
                  <p className="text-xs font-bold text-gray-400">{a.recurrence} · {a.channels}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-[#9871F5]">{a.time}</span>
                <form action={deleteAlarm}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-xs text-red-400 font-bold">✕</button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <form action={createAlarm} className="clay-panel !bg-[#fce38a] p-6 space-y-3 h-fit text-amber-950">
          <h2 className="text-xl font-bold">Novo Alarme</h2>
          <input name="label" placeholder="Ex: Tomar remédio" required className="clay-card w-full px-4 py-2 text-sm text-gray-700 outline-none" />
          <input name="time" type="time" required className="clay-card w-full px-4 py-2 text-sm text-gray-700 outline-none" />
          <select name="type" className="clay-card w-full px-4 py-2 text-sm text-gray-700 outline-none">
            <option value="generic">Geral</option>
            <option value="meal">Refeição</option>
            <option value="water">Água</option>
            <option value="medicine">Remédio</option>
            <option value="wakeup">Despertador</option>
          </select>
          <select name="recurrence" className="clay-card w-full px-4 py-2 text-sm text-gray-700 outline-none">
            <option value="daily">Todos os dias</option>
            <option value="weekdays">Dias úteis</option>
            <option value="once">Uma vez</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" name="channels" value="app" defaultChecked /> App
          </label>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" name="channels" value="discord" /> Discord
          </label>
          <button className="clay-btn w-full bg-white text-amber-700 font-extrabold py-2">Criar Alarme +</button>
        </form>
      </div>
    </div>
  );
}
