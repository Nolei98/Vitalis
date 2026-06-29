'use client';

import { useTransition, useState } from 'react';
import { sendFriendRequest } from '@/app/actions/social';

export default function SendRequestButton({ targetId }: { targetId: string }) {
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);

  function handle() {
    start(async () => {
      const r = await sendFriendRequest(targetId);
      if (r?.ok) setSent(true);
    });
  }

  return (
    <button onClick={handle} disabled={pending || sent}
      className="clay-btn px-4 py-2 text-sm font-bold text-white disabled:opacity-70"
      style={{ background: sent ? 'var(--mod-tarefas)' : 'var(--mod-social)' }}>
      {sent ? '✓ Enviado' : pending ? '...' : '+ Adicionar'}
    </button>
  );
}
