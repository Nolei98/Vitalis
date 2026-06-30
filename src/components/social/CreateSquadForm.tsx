'use client';

import { useActionState, useState } from 'react';
import { createSquad } from '@/app/actions/social';

const EMOJIS = ['🏆','📚','🏋️','🛒','🎯','⚡','🔥','🎮','🎵','🌟'];
const TYPES = [
  { value: 'estudos',  label: '📚 Estudos' },
  { value: 'academia', label: '🏋️ Academia' },
  { value: 'compras',  label: '🛒 Compras' },
  { value: 'metas',    label: '🎯 Metas livres' },
];

export default function CreateSquadForm() {
  const [state, action, pending] = useActionState(createSquad, null);
  const [open, setOpen] = useState(false);
  const [emoji, setEmoji] = useState('🏆');

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="clay-btn w-full py-3 font-extrabold text-white text-sm"
        style={{ background: 'var(--mod-social)' }}>
        ➕ Criar Squad
      </button>
    );
  }

  return (
    <form action={action} className="clay-card p-5 space-y-3"
      style={{ borderTop: '3px solid var(--mod-social)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Novo Squad</h3>
        <button type="button" onClick={() => setOpen(false)}
          className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>✕</button>
      </div>

      {/* Emoji picker */}
      <div className="flex gap-1 flex-wrap">
        {EMOJIS.map((e) => (
          <button type="button" key={e} onClick={() => setEmoji(e)}
            className="w-9 h-9 rounded-xl text-lg transition-all"
            style={{ background: emoji === e ? 'var(--mod-social-bg)' : '#F4F2FE',
                     boxShadow: emoji === e ? `0 0 0 2px var(--mod-social)` : 'none' }}>
            {e}
          </button>
        ))}
      </div>
      <input type="hidden" name="coverEmoji" value={emoji} />

      <input name="name" placeholder="Nome do squad" required
        className="clay-card w-full px-4 py-2 text-sm outline-none" />

      <select name="type" className="clay-card w-full px-4 py-2 text-sm outline-none">
        {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      <input name="description" placeholder="Descrição (opcional)"
        className="clay-card w-full px-4 py-2 text-sm outline-none" />

      {state?.error && (
        <p className="text-xs font-bold" style={{ color: 'var(--mod-notif)' }}>{state.error}</p>
      )}

      <button type="submit" disabled={pending}
        className="clay-btn w-full py-2.5 font-extrabold text-white text-sm disabled:opacity-60"
        style={{ background: 'var(--mod-social)' }}>
        {pending ? 'Criando...' : 'Criar Squad'}
      </button>
    </form>
  );
}
