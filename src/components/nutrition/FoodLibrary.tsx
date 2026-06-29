'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FOOD_DATABASE } from '@/lib/nutrition/foods';
import { foodEmoji } from '@/lib/nutrition/emoji';
import type { FoodItem, FoodCategory } from '@/lib/nutrition/types';
import { addFood, updateFood, deleteFood } from '@/app/actions/nutrition';

const CATEGORIES: (FoodCategory | 'Todos')[] = ['Todos', 'Proteína', 'Carboidrato', 'Fruta', 'Vegetal', 'Gordura', 'Laticínio', 'Bebida', 'Outro'];

interface Props { customFoods: FoodItem[]; }

export default function FoodLibrary({ customFoods }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FoodCategory | 'Todos'>('Todos');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FoodItem | null>(null);

  const customIds = useMemo(() => new Set(customFoods.map(f => String(f.id))), [customFoods]);
  const all = useMemo<FoodItem[]>(() => [...customFoods, ...FOOD_DATABASE], [customFoods]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(f => {
      const mq = !q || f.name.toLowerCase().includes(q) || (f.brand || '').toLowerCase().includes(q);
      const mc = category === 'Todos' || (f.category || 'Outro') === category;
      return mq && mc;
    });
  }, [all, query, category]);

  const openNew = () => { setEditing(null); setShowForm(true); };
  const openEdit = (f: FoodItem) => { setEditing(f); setShowForm(true); };
  const remove = async (id: string) => {
    if (!confirm('Remover este alimento da sua biblioteca?')) return;
    await deleteFood(id);
    router.refresh();
  };

  const input = 'clay-card px-4 py-3 text-gray-700 outline-none bg-white w-full';

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="🔍 Buscar alimento..." className={input} />
        <button onClick={openNew} className="clay-btn bg-[#a8e6cf] px-6 py-3 rounded-xl font-extrabold text-teal-900 whitespace-nowrap">+ Novo</button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${category === c ? 'bg-[#9871F5] text-white shadow' : 'bg-white text-gray-500'}`}>{c}</button>
        ))}
      </div>

      {showForm && (
        <form
          key={editing?.id || 'new'}
          action={async (fd: FormData) => { if (editing) await updateFood(fd); else await addFood(fd); setShowForm(false); router.refresh(); }}
          className="clay-card p-5 space-y-3 bg-white"
        >
          {editing && <input type="hidden" name="id" defaultValue={editing.id} />}
          <h3 className="font-bold text-[#4a3f72]">{editing ? 'Editar alimento' : 'Novo alimento'} <span className="text-xs font-normal text-gray-400">(macros por 100g)</span></h3>
          <div className="grid grid-cols-2 gap-3">
            <input name="name" required defaultValue={editing?.name} placeholder="Nome" className={input} />
            <input name="brand" defaultValue={editing?.brand} placeholder="Marca/origem" className={input} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <input name="proteinG" type="number" step="0.1" defaultValue={editing?.proteinG} placeholder="Prot" className={input} />
            <input name="carbsG" type="number" step="0.1" defaultValue={editing?.carbsG} placeholder="Carb" className={input} />
            <input name="fatG" type="number" step="0.1" defaultValue={editing?.fatG} placeholder="Gord" className={input} />
            <select name="category" defaultValue={editing?.category || 'Outro'} className={input}>
              {CATEGORIES.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="clay-btn bg-[#9871F5] text-white px-6 py-3 rounded-xl font-extrabold flex-1">Salvar</button>
            <button type="button" onClick={() => setShowForm(false)} className="clay-btn bg-white px-6 py-3 rounded-xl font-bold text-gray-500">Cancelar</button>
          </div>
        </form>
      )}

      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{filtered.length} alimentos</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(f => {
          const isCustom = customIds.has(String(f.id));
          return (
            <div key={f.id} className="clay-card p-4 bg-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{foodEmoji(f.name, f.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-[#4a3f72] truncate">{f.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase truncate">{f.brand}</p>
                </div>
                <span className="text-sm font-extrabold text-amber-600">{f.energyKcal}<span className="text-[9px] text-gray-400"> kcal</span></span>
              </div>
              <div className="flex gap-2 mt-3 text-[10px] font-bold">
                <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-lg">{f.proteinG}g P</span>
                <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-lg">{f.carbsG}g C</span>
                <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">{f.fatG}g G</span>
              </div>
              {isCustom && (
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => openEdit(f)} className="w-8 h-8 rounded-full bg-purple-100 text-[#9871F5] font-bold">✎</button>
                  <button onClick={() => remove(String(f.id))} className="w-8 h-8 rounded-full bg-red-100 text-red-500 font-bold">×</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
