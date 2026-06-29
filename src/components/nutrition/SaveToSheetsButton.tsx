'use client';

import { useState, useTransition } from 'react';
import { saveToSheets } from '@/app/actions/sheets';

/** Botão "Salvar no Drive": envia nutrição/água para a planilha (Apps Script). */
export default function SaveToSheetsButton() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run() {
    setMsg(null);
    startTransition(async () => {
      const res = await saveToSheets();
      if (res.ok) {
        setMsg(`✅ Salvo no Drive — ${res.meals} refeições · ${res.foods} alimentos`);
      } else {
        setMsg(`⚠️ ${res.error}`);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={run}
        disabled={pending}
        className="clay-btn bg-[#9871F5] text-white font-bold py-3 px-6 hover:scale-[0.98] transition-transform disabled:opacity-60"
      >
        {pending ? '☁️ Salvando...' : '☁️ Salvar no Drive'}
      </button>
      {msg && <p className="text-xs text-gray-500 font-bold">{msg}</p>}
    </div>
  );
}
