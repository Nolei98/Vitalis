'use client';

import { useState, useTransition } from 'react';
import { sendFriendRequest } from '@/app/actions/social';
import Link from 'next/link';

interface UserResult {
  id: string;
  name: string | null;
  handle: string | null;
  bio: string | null;
}

export default function SearchUsers({ currentUserId }: { currentUserId: string }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  async function search() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/social/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }

  function addFriend(id: string) {
    start(async () => {
      await sendFriendRequest(id);
      setSent((s) => new Set([...s, id]));
    });
  }

  return (
    <div className="clay-card p-5 space-y-3" style={{ borderTop: '3px solid var(--mod-social)' }}>
      <h3 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Buscar usuários</h3>
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Nome ou @handle"
          className="clay-card flex-1 px-3 py-2 text-sm outline-none" />
        <button onClick={search} disabled={loading}
          className="clay-btn px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: 'var(--mod-social)' }}>
          {loading ? '...' : '🔍'}
        </button>
      </div>

      {results.length === 0 && q && !loading && (
        <p className="text-xs font-bold text-center py-2" style={{ color: 'var(--text-soft)' }}>
          Nenhum usuário encontrado.
        </p>
      )}

      <div className="space-y-2">
        {results.filter((u) => u.id !== currentUserId).map((u) => (
          <div key={u.id} className="flex items-center gap-3 p-2 rounded-2xl"
            style={{ background: 'var(--mod-social-bg)' }}>
            <Link href={`/social/perfil/${u.id}`}
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
              style={{ background: 'var(--mod-social)' }}>
              {(u.name || u.handle || '?')[0].toUpperCase()}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/social/perfil/${u.id}`}
                className="font-bold text-sm block truncate hover:underline"
                style={{ color: 'var(--text-strong)' }}>
                {u.name ?? u.handle}
              </Link>
              {u.handle && (
                <p className="text-xs" style={{ color: 'var(--text-soft)' }}>@{u.handle}</p>
              )}
            </div>
            <button disabled={sent.has(u.id) || pending}
              onClick={() => addFriend(u.id)}
              className="clay-btn px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
              style={{ background: sent.has(u.id) ? 'var(--mod-tarefas)' : 'var(--mod-social)' }}>
              {sent.has(u.id) ? '✓' : '+ Add'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
