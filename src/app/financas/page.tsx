import React from 'react';
import { prisma } from '@/lib/prisma';
import { addTransaction, addVault, depositToVault, addBudget, deleteBudget } from '@/app/actions/finance';
import BalanceDisplay from '@/components/BalanceDisplay';
import { startOfMonth } from 'date-fns';
import BarChartSimple from '@/components/charts/BarChartSimple';
import PageFrame from '@/components/PageFrame';

export const dynamic = 'force-dynamic';

export default async function FinancasPage() {
  const user = await prisma.user.findFirst({
    include: {
      finAccounts: {
        include: {
          transactions: {
            orderBy: { date: 'desc' },
            take: 20
          }
        }
      },
      goals: {
        where: { type: 'vault' }
      }
    }
  });

  if (!user) return <div>Carregando...</div>;

  // Orçamentos + gasto do mês por categoria
  const budgets = await prisma.budget.findMany({ where: { userId: user.id } });
  const monthTx = await prisma.transaction.findMany({
    where: { userId: user.id, kind: 'expense', date: { gte: startOfMonth(new Date()) } },
  });
  const spentByCategory = new Map<string, number>();
  for (const t of monthTx) {
    const k = (t.category || 'Outros').toLowerCase();
    spentByCategory.set(k, (spentByCategory.get(k) ?? 0) + t.amount);
  }

  const accounts = user.finAccounts;
  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#4a3f72]">
        <h1 className="text-2xl font-bold mb-4">Vitalis Finanças</h1>
        <p>Por favor, recarregue a página ou aguarde o seed ser finalizado.</p>
      </div>
    )
  }

  const mainAccount = accounts[0];

  const barData = budgets.slice(0, 6).map((b) => ({
    label: b.category.slice(0, 8),
    value: Math.round(spentByCategory.get(b.category.toLowerCase()) ?? 0),
    value2: Math.round(b.limit),
  }));

  return (
    <PageFrame>
      <header className="flex-shrink-0 flex items-center gap-3 pt-2">
        <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: 'var(--mod-financas-bg)' }}>💰</span>
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Finanças</h1>
          <p className="text-sm font-bold" style={{ color: 'var(--mod-financas)' }}>Controle suas receitas e despesas</p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Form and Summary */}
        <div className="lg:col-span-1 space-y-5">
          <div className="clay-card p-5 flex flex-col items-center" style={{ background: `linear-gradient(135deg, var(--mod-financas), var(--brand-500))` }}>
            <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-1">SALDO ATUAL</p>
            <BalanceDisplay balance={totalBalance} />
            <div className="w-full text-center text-xs font-bold rounded-xl mt-2 py-1.5"
              style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}>
              {mainAccount.name}
            </div>
            {barData.length > 0 && (
              <div className="w-full mt-4">
                <p className="text-white/60 text-[10px] font-bold uppercase mb-1">Gasto vs Limite</p>
                <BarChartSimple
                  data={barData}
                  color="rgba(255,255,255,0.85)"
                  color2="rgba(255,255,255,0.30)"
                  height={90}
                  formatValue={(v) => `R$${v}`}
                />
              </div>
            )}
          </div>

          <div className="clay-card p-5 text-gray-800">
            <h2 className="text-xl font-bold mb-4 text-[#4a3f72]">Nova Transação</h2>
            <form action={addTransaction} className="space-y-4">
              <input type="hidden" name="accountId" value={mainAccount.id} />
              
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="kind" value="expense" className="peer sr-only" defaultChecked />
                  <div className="text-center py-2 rounded-xl font-bold text-sm bg-gray-100 text-gray-400 peer-checked:bg-red-100 peer-checked:text-red-600 transition-colors">
                    Saída
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="kind" value="income" className="peer sr-only" />
                  <div className="text-center py-2 rounded-xl font-bold text-sm bg-gray-100 text-gray-400 peer-checked:bg-emerald-100 peer-checked:text-emerald-600 transition-colors">
                    Entrada
                  </div>
                </label>
              </div>

              <div>
                <input name="amount" type="number" step="0.01" required className="w-full clay-card px-4 py-3 text-gray-700 outline-none" placeholder="R$ 0,00" />
              </div>
              
              <div>
                <input name="category" type="text" required className="w-full clay-card px-4 py-3 text-gray-700 outline-none" placeholder="Categoria (ex: Mercado)" />
              </div>
              
              <div>
                <input name="note" type="text" className="w-full clay-card px-4 py-3 text-gray-700 outline-none" placeholder="Descrição (opcional)" />
              </div>
              
              <button type="submit" className="clay-btn w-full py-3 rounded-xl font-extrabold mt-2 text-white"
                style={{ background: 'var(--mod-financas)' }}>
                Registrar +
              </button>
            </form>
          </div>

          <div className="clay-card p-6 border-2 border-amber-300 bg-amber-50">
            <h2 className="text-xl font-bold mb-4 text-amber-900">Novo Cofre</h2>
            <form action={addVault} className="space-y-4">
              <input name="title" type="text" required className="w-full clay-card px-4 py-2 outline-none" placeholder="Nome (Ex: Viagem)" />
              <input name="target" type="number" step="0.01" required className="w-full clay-card px-4 py-2 outline-none" placeholder="Meta R$" />
              <button type="submit" className="clay-btn bg-amber-400 text-amber-950 w-full py-2 rounded-xl font-bold hover:scale-95">
                Criar Cofre
              </button>
            </form>
          </div>

          {/* Orçamentos */}
          <div className="clay-card p-6">
            <h2 className="text-xl font-bold mb-4 text-[#4a3f72]">Orçamentos (mês)</h2>
            <div className="space-y-3 mb-4">
              {budgets.length === 0 && <p className="text-gray-400 font-bold text-sm">Nenhum orçamento.</p>}
              {budgets.map((b) => {
                const spent = spentByCategory.get(b.category.toLowerCase()) ?? 0;
                const pct = Math.min(Math.round((spent / b.limit) * 100), 100);
                const over = spent > b.limit;
                return (
                  <div key={b.id}>
                    <div className="flex justify-between text-sm font-bold mb-1">
                      <span className="text-gray-600">{b.category} {over && <span className="text-red-500">⚠️</span>}</span>
                      <span className={over ? 'text-red-500' : 'text-gray-500'}>
                        R$ {spent.toFixed(0)} / {b.limit.toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${over ? 'bg-red-400' : 'bg-emerald-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <form action={deleteBudget} className="text-right">
                      <input type="hidden" name="id" value={b.id} />
                      <button className="text-[10px] text-red-400 font-bold">remover</button>
                    </form>
                  </div>
                );
              })}
            </div>
            <form action={addBudget} className="flex gap-2">
              <input name="category" placeholder="Categoria" required className="clay-card flex-1 px-3 py-2 text-sm outline-none" />
              <input name="limit" type="number" step="0.01" placeholder="Limite" required className="clay-card w-24 px-3 py-2 text-sm outline-none" />
              <button className="clay-btn bg-[#9871F5] text-white font-bold px-3 text-sm">+</button>
            </form>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2 clay-card p-6 h-[700px] flex flex-col">
          <h2 className="text-xl font-extrabold mb-5" style={{ color: 'var(--text-strong)' }}>Últimas Movimentações</h2>
          
          <div className="space-y-3 overflow-y-auto flex-1 pr-2 no-scrollbar">
            {mainAccount.transactions.map((t) => (
              <div key={t.id} className="clay-card p-4 flex justify-between items-center bg-gray-50/50">
                <div className="flex gap-4 items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${t.kind === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {t.kind === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-extrabold text-[#4a3f72]">{t.category}</p>
                    {t.note && <p className="text-xs font-bold text-gray-400">{t.note}</p>}
                    <p className="text-[10px] font-bold text-gray-400 mt-1">{t.date.toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className={`font-extrabold text-lg ${t.kind === 'income' ? 'text-emerald-500' : 'text-gray-700'}`}>
                  R$ {t.amount.toFixed(2).replace('.', ',')}
                </div>
              </div>
            ))}
            
            {mainAccount.transactions.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-purple-900/50">
                <span className="text-4xl mb-4">💰</span>
                <p className="font-bold">Nenhuma transação registrada.</p>
              </div>
            )}
          </div>
          
          {user.goals.length > 0 && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-xl font-bold text-[#4a3f72] mb-6">Meus Cofres</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.goals.map((vault) => (
                  <div key={vault.id} className="clay-card p-4 bg-[#fce38a]">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-bold text-amber-900">{vault.title}</span>
                       <span className="text-xs font-black text-amber-800 bg-white/40 px-2 py-1 rounded">R$ {vault.current} / {vault.target}</span>
                    </div>
                    <div className="w-full bg-white/40 h-2 rounded-full mb-4">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min((vault.current / (vault.target || 1)) * 100, 100)}%` }}></div>
                    </div>
                    <form action={depositToVault} className="flex gap-2">
                      <input type="hidden" name="vaultId" value={vault.id} />
                      <input type="hidden" name="accountId" value={mainAccount.id} />
                      <input name="amount" type="number" step="0.01" required className="w-full bg-white/60 px-2 py-1 rounded text-sm outline-none" placeholder="Guardar R$" />
                      <button type="submit" className="bg-amber-600 text-white px-2 rounded font-bold hover:bg-amber-700">+</button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
      </div>
    </PageFrame>
  );
}
