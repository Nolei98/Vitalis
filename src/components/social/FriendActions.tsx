'use client';

import { useTransition } from 'react';
import { respondFriendRequest, removeFriend } from '@/app/actions/social';

interface Props {
  friendshipId: string;
  type: 'received' | 'friend';
}

export default function FriendActions({ friendshipId, type }: Props) {
  const [pending, start] = useTransition();

  if (type === 'received') {
    return (
      <div className="flex gap-2">
        <button disabled={pending}
          onClick={() => start(() => { void respondFriendRequest(friendshipId, true); })}
          className="clay-btn px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
          style={{ background: 'var(--mod-tarefas)' }}>
          ✓ Aceitar
        </button>
        <button disabled={pending}
          onClick={() => start(() => { void respondFriendRequest(friendshipId, false); })}
          className="clay-btn px-3 py-1.5 text-xs font-bold disabled:opacity-60"
          style={{ background: 'var(--mod-notif-bg)', color: 'var(--mod-notif-strong)' }}>
          ✕
        </button>
      </div>
    );
  }

  return (
    <button disabled={pending}
      onClick={() => start(() => { void removeFriend(friendshipId); })}
      className="text-xs font-bold disabled:opacity-60"
      style={{ color: 'var(--text-soft)' }}>
      remover
    </button>
  );
}
