'use client';

import { useTransition, useState } from 'react';
import { joinSquadByCode } from '@/app/actions/social';

export default function JoinSquadForm() {
  const [pending, start] = useTransition();
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    start(async () => {
      const r = await joinSquadByCode(code.trim());
      if (!r.ok) setErr(r.error ?? 'Erro.');
    });
  }

  return (
    <form onSubmit={submit} className="clay-card p-4 space-y-3">
      <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-strong)' }}>Entrar com código</h3>
      <div className="flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)}
          placeholder="Código de convite" required
          className="clay-card flex-1 px-3 py-2 text-sm outline-none" />
        <button type="submit" disabled={pending}
          className="clay-btn px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: 'var(--mod-social)' }}>
          {pending ? '...' : 'Entrar'}
        </button>
      </div>
      {err && <p className="text-xs font-bold" style={{ color: 'var(--mod-notif)' }}>{err}</p>}
    </form>
  );
}
