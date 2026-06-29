'use client';

import { useState, useTransition } from 'react';
import { syncNow } from '@/app/actions/sync';

export default function SyncButton() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run() {
    setMsg(null);
    startTransition(async () => {
      const { results } = await syncNow();
      if (!results.length) {
        setMsg('Nenhuma integração conectada.');
        return;
      }
      setMsg(
        results
          .map((r) => `${r.provider}: ${r.ok ? `${r.count} itens` : `erro (${r.error ?? '?'})`}`)
          .join(' · '),
      );
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={run}
        disabled={pending}
        className="clay-btn bg-[#9871F5] text-white font-bold py-3 px-6 hover:scale-[0.98] transition-transform disabled:opacity-60"
      >
        {pending ? '🔄 Sincronizando...' : '🔄 Sincronizar agora'}
      </button>
      {msg && <p className="text-xs text-gray-500 font-bold">{msg}</p>}
    </div>
  );
}
