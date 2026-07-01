import React from 'react';
import { HelpCircle } from 'lucide-react';

/** Popover "?" nativo (via <details>), sem JS de cliente — explica onde achar o link/token. */
export default function HelpHint({ title, steps }: { title: string; steps: string[] }) {
  return (
    <details className="group relative inline-block ml-2 align-middle">
      <summary className="list-none cursor-pointer inline-flex text-gray-400 hover:text-[#9871F5] transition-colors">
        <HelpCircle size={18} strokeWidth={2} />
      </summary>
      <div className="absolute z-20 top-6 left-0 w-72 clay-card p-4 text-xs font-medium text-gray-600 shadow-lg bg-white">
        <p className="font-bold text-[#4a3f72] mb-2">{title}</p>
        <ol className="list-decimal list-inside space-y-1">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
    </details>
  );
}
