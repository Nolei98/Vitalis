'use client';

import { useState, useTransition } from 'react';
import { backupUser } from '@/app/actions/sheets';

export default function UserBackupButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run() {
    setMsg(null);
    startTransition(async () => {
      const res = await backupUser(userId);
      setMsg(res.ok ? `✅ ${res.meals} ref · ${res.foods} alim` : `⚠️ ${res.error}`);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={run}
        disabled={pending}
        className="clay-btn bg-[#9871F5] text-white text-sm font-bold py-2 px-4 hover:scale-[0.98] transition-transform disabled:opacity-60"
      >
        {pending ? '☁️...' : '☁️ Backup'}
      </button>
      {msg && <span className="text-[11px] text-gray-500 font-bold">{msg}</span>}
    </div>
  );
}
