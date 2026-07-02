'use client';

import { useState, useTransition, useActionState } from 'react';
import {
  logSession, addSquadGoal, addChallenge,
  addShoppingItem, toggleShoppingItem, leaveSquad,
} from '@/app/actions/social';

interface Member { id: string; userId: string; role: string; joinedAt: string; user: { id: string; name: string | null; handle: string | null } }
interface Score { userId: string; points: number; streak: number; user: { id: string; name: string | null; handle: string | null } }
interface Session { id: string; userId: string; type: string; durationMin: number | null; tags: string | null; notes: string | null; proofImageUrl: string | null; startedAt: string; user: { id: string; name: string | null; handle: string | null } }
interface GoalItem { id: string; title: string; metric: string | null; target: number | null }
interface ChallengeItem { id: string; title: string; metricTarget: number | null; startAt: string; endAt: string }
interface ShopItem { id: string; name: string; valor: number | null; bought: boolean; boughtById: string | null }

interface Props {
  squadId: string;
  squadType: string;
  squadGoals: GoalItem[];
  challenges: ChallengeItem[];
  shoppingItems: ShopItem[];
  members: Member[];
  leaderboard: Score[];
  sessions: Session[];
  currentUserId: string;
  isAdmin: boolean;
  accentColor: string;
}

const SESSION_TYPES: Record<string, { emoji: string; label: string }[]> = {
  estudos:  [{ emoji: '📚', label: 'Foco geral' }, { emoji: '📝', label: 'Revisão' }, { emoji: '🔢', label: 'Exercícios' }],
  academia: [{ emoji: '🏋️', label: 'Musculação' }, { emoji: '🏃', label: 'Cardio' }, { emoji: '🧘', label: 'Yoga/Flex' }],
  compras:  [{ emoji: '🛒', label: 'Compras' }],
  metas:    [{ emoji: '🎯', label: 'Progresso' }],
};

export default function SquadTabs({ squadId, squadType, squadGoals, challenges, shoppingItems, members, leaderboard, sessions, currentUserId, isAdmin, accentColor }: Props) {
  const tabs = ['Ranking', 'Sessões', 'Metas', squadType === 'compras' ? 'Lista' : 'Desafios', 'Membros'];
  const [tab, setTab] = useState(tabs[0]);
  const [sessionState, sessionAction, sessionPending] = useActionState(logSession, null);
  const [goalState, goalAction, goalPending] = useActionState(addSquadGoal, null);
  const [challengeState, challengeAction, challengePending] = useActionState(addChallenge, null);
  const [shopState, shopAction, shopPending] = useActionState(addShoppingItem, null);
  const [pendingToggle, startToggle] = useTransition();
  const [pendingLeave, startLeave] = useTransition();
  const [sessionType, setSessionType] = useState(SESSION_TYPES[squadType]?.[0]?.label ?? 'Geral');

  const sessionTypes = SESSION_TYPES[squadType] ?? [{ emoji: '⚡', label: 'Sessão' }];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(0,0,0,0.05)' }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 text-xs font-bold rounded-xl transition-all"
            style={tab === t
              ? { background: 'white', color: accentColor, boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }
              : { color: 'var(--text-soft)' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">

        {/* Ranking */}
        {tab === 'Ranking' && (
          <div className="clay-card p-5">
            <h3 className="text-sm font-extrabold mb-4" style={{ color: 'var(--text-strong)' }}>
              🏆 Ranking da Semana
            </h3>
            {leaderboard.length === 0 && (
              <p className="text-sm text-center py-6 font-bold" style={{ color: 'var(--text-soft)' }}>
                Nenhuma sessão esta semana ainda!
              </p>
            )}
            {leaderboard.map((s, i) => (
              <div key={s.userId} className="flex items-center gap-3 p-3 rounded-2xl mb-2"
                style={{
                  background: i === 0 ? `${accentColor}18` : '#F9F8FF',
                  outline: s.userId === currentUserId ? `2px solid ${accentColor}` : 'none',
                }}>
                <span className="text-lg font-black w-8 text-center">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                  style={{ background: accentColor }}>
                  {(s.user.name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: 'var(--text-strong)' }}>
                    {s.user.name ?? s.user.handle}
                    {s.userId === currentUserId && <span className="ml-1 text-xs" style={{ color: accentColor }}>(você)</span>}
                  </p>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>🔥 {s.streak} streak</p>
                </div>
                <span className="font-black text-lg" style={{ color: accentColor }}>{s.points} XP</span>
              </div>
            ))}
          </div>
        )}

        {/* Sessões */}
        {tab === 'Sessões' && (
          <div className="space-y-4">
            {/* Log form */}
            <form action={sessionAction} className="clay-card p-5 space-y-3"
              style={{ borderTop: `3px solid ${accentColor}` }}>
              <input type="hidden" name="squadId" value={squadId} />
              <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-strong)' }}>Registrar Sessão</h3>

              <div className="flex gap-2 flex-wrap">
                {sessionTypes.map((st) => (
                  <button type="button" key={st.label}
                    onClick={() => setSessionType(st.label)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl transition-all"
                    style={{
                      background: sessionType === st.label ? `${accentColor}20` : '#F4F2FE',
                      color: sessionType === st.label ? accentColor : 'var(--text-soft)',
                      outline: sessionType === st.label ? `1.5px solid ${accentColor}` : 'none',
                    }}>
                    {st.emoji} {st.label}
                  </button>
                ))}
              </div>
              <input type="hidden" name="type" value={sessionType} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>Duração (min)</label>
                  <input name="durationMin" type="number" min="1" max="600" required
                    className="clay-card w-full px-3 py-2 text-sm outline-none mt-1" placeholder="60" />
                </div>
                <div>
                  <label className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>Tags</label>
                  <input name="tags" placeholder="matemática, enem"
                    className="clay-card w-full px-3 py-2 text-sm outline-none mt-1" />
                </div>
              </div>
              <input name="notes" placeholder="Notas (opcional)"
                className="clay-card w-full px-3 py-2 text-sm outline-none" />

              {sessionState?.ok && (
                <p className="text-xs font-bold" style={{ color: accentColor }}>
                  ✓ +{sessionState.xp} XP ganhos!
                </p>
              )}

              <button type="submit" disabled={sessionPending}
                className="clay-btn w-full py-2.5 font-extrabold text-white text-sm disabled:opacity-60"
                style={{ background: accentColor }}>
                {sessionPending ? 'Registrando...' : '⚡ Registrar Sessão'}
              </button>
            </form>

            {/* Sessions list */}
            <div className="clay-card p-5 space-y-3">
              <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-strong)' }}>Histórico Recente</h3>
              {sessions.length === 0 && (
                <p className="text-sm text-center py-4 font-bold" style={{ color: 'var(--text-soft)' }}>
                  Nenhuma sessão ainda.
                </p>
              )}
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: s.userId === currentUserId ? `${accentColor}12` : '#F9F8FF' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs"
                    style={{ background: accentColor }}>
                    {(s.user.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text-strong)' }}>
                      {s.user.name} — {s.type}
                      {s.tags && <span className="ml-1 text-xs font-normal" style={{ color: 'var(--text-soft)' }}>({s.tags})</span>}
                    </p>
                    <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>
                      {s.durationMin}min · {new Date(s.startedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {s.proofImageUrl && (
                    <img src={s.proofImageUrl} alt="prova" className="w-10 h-10 rounded-xl object-cover" />
                  )}
                  <span className="font-black text-sm" style={{ color: accentColor }}>
                    +{Math.max(1, Math.floor((s.durationMin ?? 0) / 5))} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metas */}
        {tab === 'Metas' && (
          <div className="space-y-4">
            <form action={goalAction} className="clay-card p-5 space-y-3"
              style={{ borderTop: `3px solid ${accentColor}` }}>
              <input type="hidden" name="squadId" value={squadId} />
              <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-strong)' }}>Nova Meta do Squad</h3>
              <input name="title" placeholder="Título da meta" required
                className="clay-card w-full px-4 py-2 text-sm outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input name="metric" placeholder="Métrica (ex: horas)"
                  className="clay-card px-3 py-2 text-sm outline-none" />
                <input name="target" type="number" step="any" placeholder="Alvo"
                  className="clay-card px-3 py-2 text-sm outline-none" />
              </div>
              <button type="submit" disabled={goalPending}
                className="clay-btn w-full py-2 font-bold text-white text-sm disabled:opacity-60"
                style={{ background: accentColor }}>
                {goalPending ? '...' : 'Adicionar Meta +'}
              </button>
            </form>

            <div className="clay-card p-5 space-y-3">
              {squadGoals.length === 0 && (
                <p className="text-sm text-center py-4 font-bold" style={{ color: 'var(--text-soft)' }}>
                  Nenhuma meta definida.
                </p>
              )}
              {squadGoals.map((g) => (
                <div key={g.id} className="p-3 rounded-2xl" style={{ background: `${accentColor}10` }}>
                  <p className="font-extrabold text-sm" style={{ color: 'var(--text-strong)' }}>{g.title}</p>
                  {g.metric && g.target && (
                    <p className="text-xs font-bold mt-0.5" style={{ color: accentColor }}>
                      Meta: {g.target} {g.metric}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de compras */}
        {tab === 'Lista' && squadType === 'compras' && (
          <div className="space-y-4">
            <form action={shopAction} className="clay-card p-4 flex gap-2 items-end">
              <input type="hidden" name="squadId" value={squadId} />
              <input name="name" placeholder="Item" required className="clay-card flex-1 px-3 py-2 text-sm outline-none" />
              <input name="valor" type="number" step="0.01" placeholder="R$" className="clay-card w-20 px-3 py-2 text-sm outline-none" />
              <button type="submit" disabled={shopPending}
                className="clay-btn px-4 py-2 font-bold text-white text-sm disabled:opacity-60"
                style={{ background: accentColor }}>+</button>
            </form>

            <div className="clay-card p-5 space-y-2">
              {shoppingItems.length === 0 && (
                <p className="text-sm text-center py-4 font-bold" style={{ color: 'var(--text-soft)' }}>
                  Lista vazia.
                </p>
              )}
              {shoppingItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl"
                  style={{ background: item.bought ? '#F0FDF4' : '#F9F8FF' }}>
                  <button disabled={pendingToggle}
                    onClick={() => startToggle(() => { void toggleShoppingItem(item.id, squadId); })}
                    className="w-6 h-6 rounded-lg border-2 flex items-center justify-center text-sm transition-all"
                    style={{
                      borderColor: item.bought ? '#2BC48A' : '#D1D5DB',
                      background: item.bought ? '#2BC48A' : 'white',
                      color: 'white',
                    }}>
                    {item.bought ? '✓' : ''}
                  </button>
                  <span className="flex-1 text-sm font-bold"
                    style={{ color: item.bought ? 'var(--text-soft)' : 'var(--text-strong)',
                             textDecoration: item.bought ? 'line-through' : 'none' }}>
                    {item.name}
                  </span>
                  {item.valor && (
                    <span className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>
                      R$ {item.valor.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Desafios */}
        {tab === 'Desafios' && squadType !== 'compras' && (
          <div className="space-y-4">
            <form action={challengeAction} className="clay-card p-5 space-y-3"
              style={{ borderTop: `3px solid ${accentColor}` }}>
              <input type="hidden" name="squadId" value={squadId} />
              <h3 className="text-sm font-extrabold" style={{ color: 'var(--text-strong)' }}>Novo Desafio</h3>
              <input name="title" placeholder="Ex: 30h de foco essa semana" required
                className="clay-card w-full px-4 py-2 text-sm outline-none" />
              <input name="metricTarget" type="number" step="any" placeholder="Meta numérica (opcional)"
                className="clay-card w-full px-4 py-2 text-sm outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>Início</label>
                  <input name="startAt" type="date" required className="clay-card w-full px-3 py-2 text-sm outline-none mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>Fim</label>
                  <input name="endAt" type="date" required className="clay-card w-full px-3 py-2 text-sm outline-none mt-1" />
                </div>
              </div>
              <button type="submit" disabled={challengePending}
                className="clay-btn w-full py-2 font-bold text-white text-sm disabled:opacity-60"
                style={{ background: accentColor }}>
                {challengePending ? '...' : 'Criar Desafio +'}
              </button>
            </form>

            <div className="clay-card p-5 space-y-3">
              {challenges.length === 0 && (
                <p className="text-sm text-center py-4 font-bold" style={{ color: 'var(--text-soft)' }}>
                  Nenhum desafio ainda.
                </p>
              )}
              {challenges.map((c) => {
                const now = Date.now();
                const start = new Date(c.startAt).getTime();
                const end = new Date(c.endAt).getTime();
                const active = now >= start && now <= end;
                return (
                  <div key={c.id} className="p-3 rounded-2xl"
                    style={{ background: active ? `${accentColor}12` : '#F9F8FF' }}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-extrabold text-sm" style={{ color: 'var(--text-strong)' }}>{c.title}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: active ? `${accentColor}20` : '#F4F2FE',
                          color: active ? accentColor : 'var(--text-soft)',
                        }}>
                        {active ? '🔴 ativo' : now > end ? '✓ encerrado' : '⏳ em breve'}
                      </span>
                    </div>
                    {c.metricTarget && (
                      <p className="text-xs font-bold mt-1" style={{ color: accentColor }}>Meta: {c.metricTarget}</p>
                    )}
                    <p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>
                      {new Date(c.startAt).toLocaleDateString('pt-BR')} → {new Date(c.endAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Membros */}
        {tab === 'Membros' && (
          <div className="clay-card p-5 space-y-3">
            <h3 className="text-sm font-extrabold mb-2" style={{ color: 'var(--text-strong)' }}>
              Membros ({members.length})
            </h3>
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: m.userId === currentUserId ? `${accentColor}12` : '#F9F8FF' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: accentColor }}>
                  {(m.user.name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: 'var(--text-strong)' }}>
                    {m.user.name ?? m.user.handle}
                    {m.userId === currentUserId && ' (você)'}
                  </p>
                  {m.user.handle && (
                    <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>@{m.user.handle}</p>
                  )}
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: m.role === 'admin' ? `${accentColor}20` : '#F4F2FE',
                    color: m.role === 'admin' ? accentColor : 'var(--text-soft)',
                  }}>
                  {m.role === 'admin' ? '⭐ admin' : 'membro'}
                </span>
              </div>
            ))}

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-soft)' }}>
                Código de convite:
                <span className="ml-2 font-black" style={{ color: 'var(--text-strong)' }}>{members[0] ? '(ver na URL do squad)' : ''}</span>
              </p>
              <button
                onClick={() => startLeave(() => { void leaveSquad(squadId); })}
                disabled={pendingLeave}
                className="text-xs font-bold" style={{ color: '#FB7185' }}>
                Sair do squad
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
