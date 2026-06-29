'use client';

import { useActionState } from 'react';
import { updateProfile } from '@/app/actions/social';
import Link from 'next/link';

export default function ConfigurarPerfil() {
  const [state, action, pending] = useActionState(updateProfile, null);

  return (
    <div className="space-y-6 page-enter pb-8 max-w-md">
      <header className="flex items-center gap-3 pt-2">
        <Link href="/social" className="clay-btn px-3 py-2 text-sm font-bold"
          style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>← Social</Link>
        <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Meu Perfil</h1>
      </header>

      <form action={action} className="clay-card p-6 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1 block"
            style={{ color: 'var(--text-soft)' }}>Nome</label>
          <input name="name" placeholder="Seu nome"
            className="clay-card w-full px-4 py-2.5 text-sm outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1 block"
            style={{ color: 'var(--text-soft)' }}>@handle</label>
          <input name="handle" placeholder="handle (letras, números, _)"
            className="clay-card w-full px-4 py-2.5 text-sm outline-none" />
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-soft)' }}>
            Só letras, números e _ (sem espaços). Único entre todos.
          </p>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-1 block"
            style={{ color: 'var(--text-soft)' }}>Bio</label>
          <textarea name="bio" placeholder="Conte um pouco sobre você..."
            className="clay-card w-full px-4 py-2.5 text-sm outline-none resize-none h-20" />
        </div>

        {state?.error && (
          <p className="text-xs font-bold" style={{ color: 'var(--mod-notif)' }}>{state.error}</p>
        )}
        {state?.ok && (
          <p className="text-xs font-bold" style={{ color: 'var(--mod-tarefas)' }}>✓ Perfil atualizado!</p>
        )}

        <button type="submit" disabled={pending}
          className="clay-btn w-full py-3 font-extrabold text-white disabled:opacity-60"
          style={{ background: 'var(--mod-social)' }}>
          {pending ? 'Salvando...' : 'Salvar perfil'}
        </button>
      </form>
    </div>
  );
}
