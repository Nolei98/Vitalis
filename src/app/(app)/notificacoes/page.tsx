import React from 'react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { createRule, toggleRule, deleteRule } from '@/app/actions/notifications';
import PageFrame from '@/components/PageFrame';
import ModIcon from '@/components/ModIcon';

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
    <PageFrame>
      <header className="flex-shrink-0 flex items-center gap-3 pt-2">
        <ModIcon mod="notif" size="lg" />
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Notificações</h1>
          <p className="text-sm font-bold" style={{ color: 'var(--mod-notif)' }}>Regras de o quê, quando e por qual canal</p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 clay-card p-5 space-y-3">
          <h2 className="text-base font-extrabold mb-2" style={{ color: 'var(--text-strong)' }}>Regras ativas</h2>
          {rules.length === 0 && (
            <p className="text-center py-6 font-bold text-sm" style={{ color: 'var(--text-soft)' }}>Sem regras.</p>
          )}
          {rules.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: r.enabled ? 'var(--mod-notif-bg)' : '#F8FAFC' }}>
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--text-strong)' }}>{EVENT_LABEL[r.event] ?? r.event}</p>
                <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>
                  canal: {r.channel}{r.window ? ` · janela: ${r.window}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <form action={toggleRule}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="clay-btn text-xs font-bold px-3 py-2 text-white"
                    style={{ background: r.enabled ? 'var(--mod-notif)' : 'rgba(0,0,0,0.10)', color: r.enabled ? 'white' : 'var(--text-soft)' }}>
                    {r.enabled ? 'ativa' : 'pausada'}
                  </button>
                </form>
                <form action={deleteRule}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="text-xs font-bold" style={{ color: '#FB7185' }}>✕</button>
                </form>
              </div>
            </div>
          ))}
        </div>

        <form action={createRule} className="clay-card p-5 space-y-3 h-fit"
          style={{ borderTop: '3px solid var(--mod-notif)' }}>
          <h2 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Nova Regra</h2>
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
          <button className="clay-btn w-full text-white font-bold py-2.5"
            style={{ background: 'var(--mod-notif)' }}>Criar Regra +</button>
        </form>
      </div>
      </div>
    </PageFrame>
  );
}
