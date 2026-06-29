import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { createRule, toggleRule, deleteRule } from '@/app/actions/notifications';

export const dynamic = 'force-dynamic';

const EVENT_LABEL: Record<string, string> = {
  daily_digest: '☀️ Resumo diário',
  task_due: '✅ Tarefa vencendo',
  water_reminder: '💧 Lembrete de água',
  event_soon: '📅 Evento próximo',
  budget_over: '💰 Orçamento estourado',
};

export default async function NotificacoesPage() {
  const user = await getCurrentUser();
  const rules = await prisma.notificationRule.findMany({ where: { userId: user.id } });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
      <header>
        <h1 className="text-4xl font-extrabold text-[#4a3f72]">Central de Notificações</h1>
        <p className="text-gray-500 font-bold">Regras de o quê, quando e por qual canal</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 clay-card p-6 space-y-3">
          <h2 className="text-xl font-bold text-[#4a3f72]">Regras ativas</h2>
          {rules.length === 0 && <p className="text-gray-400 font-bold text-center py-6">Sem regras.</p>}
          {rules.map((r) => (
            <div key={r.id} className="flex items-center justify-between border border-gray-100 rounded-2xl p-4">
              <div>
                <p className="font-bold text-gray-700">{EVENT_LABEL[r.event] ?? r.event}</p>
                <p className="text-xs font-bold text-gray-400">
                  canal: {r.channel}{r.window ? ` · janela: ${r.window}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <form action={toggleRule}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className={`clay-btn text-xs font-bold px-3 py-2 ${r.enabled ? 'bg-emerald-400 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {r.enabled ? 'ativa' : 'pausada'}
                  </button>
                </form>
                <form action={deleteRule}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="text-xs text-red-400 font-bold">✕</button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <form action={createRule} className="clay-card p-6 space-y-3 h-fit">
          <h2 className="text-lg font-bold text-[#4a3f72]">Nova Regra</h2>
          <select name="event" className="clay-card w-full px-4 py-2 text-sm outline-none">
            <option value="daily_digest">Resumo diário</option>
            <option value="task_due">Tarefa vencendo</option>
            <option value="water_reminder">Lembrete de água</option>
            <option value="event_soon">Evento próximo</option>
            <option value="budget_over">Orçamento estourado</option>
          </select>
          <select name="channel" className="clay-card w-full px-4 py-2 text-sm outline-none">
            <option value="discord">Discord</option>
            <option value="app">App</option>
          </select>
          <input name="window" placeholder="Janela (ex: 07:00-21:00)" className="clay-card w-full px-4 py-2 text-sm outline-none" />
          <button className="clay-btn w-full bg-[#9871F5] text-white font-bold py-2">Criar Regra +</button>
        </form>
      </div>
    </div>
  );
}
