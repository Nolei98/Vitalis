'use client';

import { useState, useTransition } from 'react';
import { backupAllUsers } from '@/app/actions/sheets';

export default function BackupAllButton() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run() {
    setMsg(null);
    startTransition(async () => {
      const res = await backupAllUsers();
      if (res.ok) {
        setMsg(`✅ ${res.succeeded}/${res.users} ok${res.failed ? ` · ${res.failed} falha(s)` : ''}`);
      } else {
        setMsg(`⚠️ ${res.error}`);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={run}
        disabled={pending}
        className="clay-btn bg-[#9871F5] text-white font-bold py-3 px-6 hover:scale-[0.98] transition-transform disabled:opacity-60"
      >
        {pending ? '☁️ Salvando...' : '☁️ Backup de todos'}
      </button>
      {msg && <span className="text-xs text-gray-500 font-bold">{msg}</span>}
    </div>
  );
}
