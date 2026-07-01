'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Repeat, CalendarCheck, ShoppingCart, Search, ShieldCheck, XCircle } from 'lucide-react';
import {
  regenerateDay, regenerateMeal, swapItem, recalibratePlan, savePlan, endPlan,
  applyPlanToDay, generateShoppingList, searchFoodCatalog,
} from '@/app/actions/diet';
import { WEEKDAY_LABEL, MEAL_TYPE_LABEL, type DietPlanRow, type PlannedItemRow } from './types';

function fmtDate(d: Date | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR');
}

function ItemSwap({ item, onDone }: { item: PlannedItemRow; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; per100Kcal: number }[]>([]);
  const [isPending, startTransition] = useTransition();

  function search(q: string) {
    setQuery(q);
    startTransition(async () => {
      const found = q.trim() ? await searchFoodCatalog(q) : [];
      setResults(found.map((f) => ({ id: f.id, name: f.name, per100Kcal: f.per100Kcal })));
    });
  }

  function pick(foodId: string) {
    startTransition(async () => {
      await swapItem(item.id, foodId);
      setOpen(false);
      onDone();
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[10px] font-bold" style={{ color: 'var(--mod-dieta)' }}>
        Trocar
      </button>
    );
  }
  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <Search size={11} style={{ color: 'var(--clay-text-mute)' }} />
        <input autoFocus value={query} onChange={(e) => search(e.target.value)} placeholder="buscar alimento..."
          className="text-xs outline-none border-none bg-transparent w-32" />
      </div>
      {(isPending || results.length > 0) && (
        <div className="absolute z-10 top-6 left-0 w-56 clay-card p-2 space-y-1 bg-white shadow-lg">
          {isPending && <p className="text-[10px] text-gray-400">buscando…</p>}
          {results.map((r) => (
            <button key={r.id} onClick={() => pick(r.id)}
              className="w-full text-left text-xs font-semibold px-2 py-1 rounded-lg hover:bg-gray-50">
              {r.name} <span className="text-gray-400">· {r.per100Kcal}kcal/100g</span>
            </button>
          ))}
          {!isPending && query.trim() && results.length === 0 && <p className="text-[10px] text-gray-400 px-2">nada encontrado</p>}
        </div>
      )}
    </div>
  );
}

export default function PlanView({ plan }: { plan: DietPlanRow }) {
  const router = useRouter();
  const [weekday, setWeekday] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [createReminders, setCreateReminders] = useState(true);
  const [shopping, setShopping] = useState<Record<string, { name: string; quantityG: number }[]> | null>(null);
  const [shoppingRange, setShoppingRange] = useState<'day' | 'week'>('week');
  const [msg, setMsg] = useState<string | null>(null);

  const day = plan.days.find((d) => d.weekday === weekday);

  function refresh() {
    router.refresh();
  }

  function doRegenerateDay() {
    startTransition(async () => {
      await regenerateDay(plan.id, weekday);
      refresh();
    });
  }

  function doRegenerateMeal(mealId: string) {
    startTransition(async () => {
      await regenerateMeal(plan.id, mealId);
      refresh();
    });
  }

  function doRecalibrate() {
    startTransition(async () => {
      await recalibratePlan(plan.id);
      setMsg('Plano recalibrado com as metas atuais.');
      refresh();
    });
  }

  function doSave() {
    startTransition(async () => {
      await savePlan(plan.id, createReminders);
      setMsg('Plano ativado!' + (createReminders ? ' Lembretes de refeição criados.' : ''));
      refresh();
    });
  }

  function doApplyToday() {
    startTransition(async () => {
      await applyPlanToDay(plan.id, new Date());
      setMsg('Refeições de hoje aplicadas ao registro.');
      refresh();
    });
  }

  function doEndPlan() {
    if (!confirm('Encerrar este plano? Ele para de valer e os lembretes de refeição são removidos.')) return;
    startTransition(async () => {
      await endPlan(plan.id);
      refresh();
    });
  }

  function loadShopping(range: 'day' | 'week') {
    setShoppingRange(range);
    startTransition(async () => {
      const list = await generateShoppingList(plan.id, range);
      setShopping(list);
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-3 text-xs font-medium text-gray-500 flex items-center gap-2" style={{ background: 'var(--mod-dieta-bg)' }}>
        <ShieldCheck size={14} strokeWidth={2.2} style={{ color: 'var(--mod-dieta-strong)' }} />
        Sugestão educativa, não prescrição médica/nutricional.
      </div>

      <div className="clay-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-extrabold text-sm" style={{ color: 'var(--clay-text)' }}>{plan.name}</p>
          <p className="text-xs font-bold text-gray-500">
            Desde {fmtDate(plan.startDate)}{plan.endDate ? ` · meta até ${fmtDate(plan.endDate)}` : ' · sem data de término'} · {plan.kcalTarget}kcal · P{plan.proteinTarget} C{plan.carbTarget} G{plan.fatTarget}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ background: plan.status === 'active' ? 'var(--mod-tarefas-bg)' : 'var(--clay-surface)', color: plan.status === 'active' ? 'var(--mod-tarefas-strong)' : 'var(--clay-text-soft)' }}>
            {plan.status === 'active' ? 'Ativo' : plan.status === 'draft' ? 'Rascunho' : 'Arquivado'}
          </span>
          {plan.status === 'draft' && (
            <>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 cursor-pointer">
                <input type="checkbox" checked={createReminders} onChange={(e) => setCreateReminders(e.target.checked)} />
                lembretes
              </label>
              <button onClick={doSave} disabled={isPending} className="clay-btn px-4 py-2 text-xs font-bold text-white disabled:opacity-60" style={{ background: 'var(--mod-dieta)' }}>
                Salvar e ativar
              </button>
            </>
          )}
          {plan.status === 'active' && (
            <>
              <button onClick={doApplyToday} disabled={isPending} className="clay-btn px-3 py-2 text-xs font-bold text-white flex items-center gap-1" style={{ background: 'var(--mod-dieta)' }}>
                <CalendarCheck size={13} /> Aplicar hoje
              </button>
              <button onClick={doRecalibrate} disabled={isPending} className="clay-btn px-3 py-2 text-xs font-bold flex items-center gap-1" style={{ background: 'var(--clay-surface)', color: 'var(--clay-text-soft)' }}>
                <Repeat size={13} /> Recalibrar
              </button>
              <button onClick={doEndPlan} disabled={isPending} className="clay-btn px-3 py-2 text-xs font-bold flex items-center gap-1" style={{ background: '#FFE5E9', color: '#D94060' }}>
                <XCircle size={13} /> Encerrar plano
              </button>
            </>
          )}
        </div>
      </div>

      {msg && <p className="text-xs font-bold text-emerald-600 px-1">{msg}</p>}

      {/* Dias */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {WEEKDAY_LABEL.map((label, idx) => (
          <button key={idx} onClick={() => setWeekday(idx)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap"
            style={weekday === idx ? { background: 'var(--mod-dieta)', color: 'white' } : { background: 'var(--clay-surface)', color: 'var(--clay-text-soft)' }}>
            {label.slice(0, 3)}
          </button>
        ))}
        <button onClick={doRegenerateDay} disabled={isPending} title="Regenerar este dia"
          className="clay-btn px-3 py-1.5 text-xs font-bold flex items-center gap-1 ml-auto flex-shrink-0"
          style={{ background: 'var(--clay-surface)', color: 'var(--mod-dieta)' }}>
          <RefreshCw size={12} className={isPending ? 'animate-spin' : ''} /> Regenerar dia
        </button>
      </div>

      {!day && <p className="text-sm font-bold text-gray-400 text-center py-8">Sem dados pra este dia.</p>}

      {day && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {day.meals.map((meal) => {
            const totals = meal.items.reduce((a, i) => ({ kcal: a.kcal + i.kcal, p: a.p + i.proteinG, c: a.c + i.carbG, f: a.f + i.fatG }), { kcal: 0, p: 0, c: 0, f: 0 });
            return (
              <div key={meal.id} className="clay-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--mod-dieta-strong)' }}>
                      {MEAL_TYPE_LABEL[meal.type] ?? meal.type}
                    </p>
                    <p className="font-extrabold text-sm" style={{ color: 'var(--clay-text)' }}>{meal.name}</p>
                  </div>
                  <button onClick={() => doRegenerateMeal(meal.id)} disabled={isPending} title="Regenerar refeição">
                    <RefreshCw size={13} className={isPending ? 'animate-spin' : ''} style={{ color: 'var(--mod-dieta)' }} />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {meal.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5" style={{ background: 'var(--clay-surface-2)' }}>
                      <span className="font-semibold" style={{ color: 'var(--clay-text)' }}>
                        {item.name} <span className="text-gray-400">· {Math.round(item.quantityG)}g</span>
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-400 font-bold">{item.kcal}kcal</span>
                        <ItemSwap item={item} onDone={refresh} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-gray-400 pt-1">
                  Total: {totals.kcal}kcal · P{totals.p} C{totals.c} G{totals.f}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Lista de compras */}
      <div className="clay-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={15} strokeWidth={2.2} style={{ color: 'var(--mod-dieta)' }} />
            <h3 className="font-extrabold text-sm" style={{ color: 'var(--clay-text)' }}>Lista de compras</h3>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => loadShopping('day')} className="clay-btn px-3 py-1 text-xs font-bold"
              style={shopping && shoppingRange === 'day' ? { background: 'var(--mod-dieta)', color: 'white' } : { background: 'var(--clay-surface)', color: 'var(--clay-text-soft)' }}>Hoje</button>
            <button onClick={() => loadShopping('week')} className="clay-btn px-3 py-1 text-xs font-bold"
              style={shopping && shoppingRange === 'week' ? { background: 'var(--mod-dieta)', color: 'white' } : { background: 'var(--clay-surface)', color: 'var(--clay-text-soft)' }}>Semana</button>
          </div>
        </div>
        {shopping && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(shopping).map(([cat, items]) => (
              <div key={cat}>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">{cat}</p>
                <ul className="space-y-1">
                  {items.map((i) => (
                    <li key={i.name} className="text-xs font-semibold flex justify-between" style={{ color: 'var(--clay-text)' }}>
                      <span>{i.name}</span><span className="text-gray-400">{i.quantityG}g</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
