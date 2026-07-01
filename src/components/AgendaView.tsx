'use client';

import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { groupByDay, fmtTime, fmtDay, sourceColor, type CalEvent } from '@/lib/calendar';
import { startSessionAction } from '@/app/actions/study';

interface RawEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  source: string;
  location?: string | null;
  url?: string | null;
}

export default function AgendaView({ events }: { events: RawEvent[] }) {
  const [view, setView] = useState<'semana' | 'lista'>('semana');
  const parsed: CalEvent[] = events.map((e) => ({
    ...e,
    start: new Date(e.start),
    end: new Date(e.end),
  }));

  const days = groupByDay(parsed, new Date(), 7);
  const flat = [...parsed].sort((a, b) => a.start.getTime() - b.start.getTime());

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(['semana', 'lista'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`clay-btn px-5 py-2 text-sm font-bold capitalize ${
              view === v ? 'bg-[#9871F5] text-white' : 'bg-white text-gray-500'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {parsed.length === 0 && (
        <div className="clay-card p-10 text-center text-gray-400 font-bold">
          Nenhum evento. Conecte Google/Canvas em Conexões e sincronize. 📅
        </div>
      )}

      {view === 'semana' && parsed.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {days.map((d) => (
            <div key={d.date.toISOString()} className="clay-card p-4">
              <h3 className="font-extrabold text-[#4a3f72] capitalize mb-3">{fmtDay(d.date)}</h3>
              <div className="space-y-2">
                {d.events.length === 0 && <p className="text-xs text-gray-300 font-bold">livre</p>}
                {d.events.map((e) => <EventRow key={e.id} e={e} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'lista' && (
        <div className="clay-card p-4 space-y-2">
          {flat.map((e) => (
            <div key={e.id} className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 w-28 shrink-0 capitalize">
                {fmtDay(e.start)}
              </span>
              <EventRow e={e} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventRow({ e }: { e: CalEvent }) {
  const c = sourceColor(e.source);
  return (
    <div className={`group flex items-center gap-2 rounded-xl px-3 py-2 flex-1 ${c.bg}`}>
      <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`} />
      <span className="text-xs font-bold text-gray-400 w-12 shrink-0">
        {e.allDay ? 'dia' : fmtTime(e.start)}
      </span>
      <span className={`text-sm font-bold flex-1 ${c.text} truncate`}>{e.title}</span>
      <form action={startSessionAction} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <input type="hidden" name="sourceType" value="calendar" />
        <input type="hidden" name="sourceId" value={e.id} />
        <input type="hidden" name="label" value={e.title} />
        <button
          type="submit"
          title="Estudar agora"
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--mod-estudos)' }}
        >
          <BookOpen size={12} color="white" strokeWidth={2.2} />
        </button>
      </form>
    </div>
  );
}
