'use client';

import { useOptimistic, useTransition } from 'react';
import { toggleHabitToday } from '@/app/actions/habits';

export default function HabitToggle({ habitId, done }: { habitId: string; done: boolean }) {
  const [, startTransition] = useTransition();
  const [optimisticDone, setOptimisticDone] = useOptimistic(done);

  function toggle() {
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      const fd = new FormData();
      fd.set('id', habitId);
      await toggleHabitToday(fd);
    });
  }

  return (
    <button
      onClick={toggle}
      className="clay-btn text-sm font-bold px-3 py-2 text-white transition-colors"
      style={{
        background: optimisticDone ? 'var(--mod-tarefas)' : 'rgba(0,0,0,0.10)',
        color: optimisticDone ? 'white' : 'var(--text-soft)',
      }}
    >
      {optimisticDone ? '✓' : 'ok'}
    </button>
  );
}
