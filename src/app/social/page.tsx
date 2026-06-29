import { getCurrentUser } from '@/lib/user';
import { getUserSquads, getFriends, getPendingRequests, currentWeekKey } from '@/lib/social';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { SQUAD_TYPE_META } from '@/lib/social';
import CreateSquadForm from '@/components/social/CreateSquadForm';
import JoinSquadForm from '@/components/social/JoinSquadForm';
import PageFrame from '@/components/PageFrame';

export const dynamic = 'force-dynamic';

export default async function SocialHub() {
  const user = await getCurrentUser();
  const [squads, friends, pending] = await Promise.all([
    getUserSquads(user.id),
    getFriends(user.id),
    getPendingRequests(user.id),
  ]);

  // DMs: busca conversas 1:1 únicas
  const dms = await prisma.message.findMany({
    where: { dmKey: { contains: user.id } },
    distinct: ['dmKey'],
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  });

  const week = await currentWeekKey();

  return (
    <PageFrame>
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'var(--mod-social-bg)' }}>🤝</span>
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>Vitalis Social</h1>
            <p className="text-sm font-bold" style={{ color: 'var(--mod-social)' }}>Squads, chat e competição</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/social/amigos" className="clay-btn px-4 py-2 text-sm font-bold"
            style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>
            👥 Amigos {pending.length > 0 && <span className="ml-1 bg-[var(--mod-social)] text-white text-[10px] rounded-full px-1.5">{pending.length}</span>}
          </Link>
          <Link href="/social/ranking" className="clay-btn px-4 py-2 text-sm font-bold"
            style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>
            🏆 Ranking
          </Link>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Squads */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-extrabold" style={{ color: 'var(--text-strong)' }}>Meus Squads</h2>
          {squads.length === 0 && (
            <div className="clay-card p-8 flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">🏆</span>
              <p className="font-bold text-sm" style={{ color: 'var(--text-soft)' }}>Nenhum squad ainda.</p>
              <p className="text-xs" style={{ color: 'var(--text-soft)' }}>Crie um ou entre com um código de convite.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {squads.map((sq) => {
              const meta = SQUAD_TYPE_META[sq.type] ?? { emoji: '🏆', label: sq.type, color: '#9871F5' };
              return (
                <Link key={sq.id} href={`/social/squad/${sq.id}`}
                  className="clay-card p-5 hover:scale-[0.99] transition-transform block">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{sq.coverEmoji}</span>
                    <div>
                      <p className="font-extrabold text-sm" style={{ color: 'var(--text-strong)' }}>{sq.name}</p>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${meta.color}18`, color: meta.color }}>
                        {meta.emoji} {meta.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs font-bold" style={{ color: 'var(--text-soft)' }}>
                    <span>👥 {sq._count.members} membros</span>
                    <span>💬 {sq._count.messages} msgs</span>
                    <span className="ml-auto capitalize font-bold"
                      style={{ color: sq.members[0]?.role === 'admin' ? 'var(--mod-social)' : 'var(--text-soft)' }}>
                      {sq.members[0]?.role === 'admin' ? '⭐ admin' : 'membro'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* DMs */}
          {friends.length > 0 && (
            <div className="clay-card p-5">
              <h2 className="text-base font-extrabold mb-3" style={{ color: 'var(--text-strong)' }}>Conversas</h2>
              <div className="space-y-2">
                {friends.map(({ friend, friendshipId }) => (
                  <Link key={friendshipId}
                    href={`/social/chat/dm-${[user.id, friend.id].sort().join('_')}`}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-[var(--mod-social-bg)] transition-colors">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                      style={{ background: 'var(--mod-social)' }}>
                      {(friend.name || friend.handle || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm" style={{ color: 'var(--text-strong)' }}>
                        {friend.name ?? friend.handle}
                      </p>
                      {friend.handle && (
                        <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>@{friend.handle}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — criar/entrar */}
        <div className="space-y-4">
          <CreateSquadForm />
          <JoinSquadForm />

          {pending.length > 0 && (
            <div className="clay-card p-4" style={{ borderTop: '3px solid var(--mod-social)' }}>
              <p className="text-sm font-extrabold mb-3" style={{ color: 'var(--text-strong)' }}>
                Pedidos de amizade ({pending.length})
              </p>
              <div className="space-y-2">
                {pending.map((f) => (
                  <div key={f.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: 'var(--mod-social)' }}>
                      {(f.requester.name || '?')[0]}
                    </div>
                    <span className="text-sm font-bold flex-1 truncate" style={{ color: 'var(--text-strong)' }}>
                      {f.requester.name}
                    </span>
                    <Link href="/social/amigos" className="text-[11px] font-bold px-2 py-1 rounded-xl"
                      style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>
                      ver
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </PageFrame>
  );
}
