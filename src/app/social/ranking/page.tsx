import { getCurrentUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { currentWeekKey } from '@/lib/social';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RankingPage() {
  const [user, week] = await Promise.all([getCurrentUser(), currentWeekKey()]);

  const [weekScores, allTimeScores, topBadges] = await Promise.all([
    prisma.userScore.findMany({
      where: { period: week },
      include: { user: { select: { id: true, name: true, handle: true } } },
      orderBy: { points: 'desc' },
      take: 20,
    }),
    prisma.userScore.groupBy({
      by: ['userId'],
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: 20,
    }),
    prisma.badge.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
  ]);

  // Enrich all-time with user data
  const allTimeUserIds = allTimeScores.map((s) => s.userId);
  const allTimeUsers = await prisma.user.findMany({
    where: { id: { in: allTimeUserIds } },
    select: { id: true, name: true, handle: true },
  });
  const userMap = Object.fromEntries(allTimeUsers.map((u) => [u.id, u]));

  const badgeUserIds = topBadges.map((b) => b.userId);
  const badgeUsers = await prisma.user.findMany({
    where: { id: { in: badgeUserIds } },
    select: { id: true, name: true, handle: true },
  });
  const badgeUserMap = Object.fromEntries(badgeUsers.map((u) => [u.id, u]));

  const MEDAL = ['🥇', '🥈', '🥉'];

  return (
    <div className="space-y-6 page-enter pb-8">
      <header className="pt-2 flex items-center gap-3">
        <Link href="/social" className="clay-btn px-3 py-2 text-sm font-bold"
          style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>← Social</Link>
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-strong)' }}>🏆 Ranking</h1>
          <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>Semana {week}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Semana */}
        <div className="lg:col-span-2 clay-card p-5" style={{ borderTop: '3px solid var(--mod-social)' }}>
          <h2 className="text-base font-extrabold mb-4" style={{ color: 'var(--text-strong)' }}>Esta Semana — XP</h2>
          {weekScores.length === 0 && (
            <div className="text-center py-8 font-bold" style={{ color: 'var(--text-soft)' }}>
              <p className="text-4xl mb-2">⚡</p>
              <p>Nenhuma sessão registrada esta semana.</p>
            </div>
          )}
          {weekScores.map((s, i) => {
            const isMe = s.userId === user.id;
            return (
              <div key={s.userId}
                className="flex items-center gap-3 p-3 rounded-2xl mb-2"
                style={{
                  background: isMe ? 'var(--mod-social-bg)' : i < 3 ? '#FAFAFE' : 'transparent',
                  outline: isMe ? '2px solid var(--mod-social)' : 'none',
                }}>
                <span className="text-xl font-black w-8 text-center">
                  {MEDAL[i] ?? <span className="text-sm text-gray-400">{i + 1}</span>}
                </span>
                <Link href={`/social/perfil/${s.userId}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm hover:opacity-80"
                  style={{ background: 'var(--mod-social)' }}>
                  {(s.user.name || '?')[0].toUpperCase()}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/social/perfil/${s.userId}`}
                    className="font-extrabold text-sm hover:underline block truncate"
                    style={{ color: 'var(--text-strong)' }}>
                    {s.user.name ?? s.user.handle ?? 'Usuário'}
                    {isMe && <span className="ml-1 text-xs font-normal" style={{ color: 'var(--mod-social)' }}>(você)</span>}
                  </Link>
                  {s.user.handle && (
                    <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>@{s.user.handle}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-lg" style={{ color: 'var(--mod-social)' }}>{s.points} XP</p>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-soft)' }}>🔥 {s.streak} streak</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar: all-time + badges */}
        <div className="space-y-4">
          <div className="clay-card p-5">
            <h2 className="text-sm font-extrabold mb-3" style={{ color: 'var(--text-strong)' }}>All Time XP</h2>
            {allTimeScores.map((s, i) => {
              const u = userMap[s.userId];
              const isMe = s.userId === user.id;
              return (
                <div key={s.userId} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-black w-5 text-center" style={{ color: 'var(--text-soft)' }}>
                    {i + 1}
                  </span>
                  <Link href={`/social/perfil/${s.userId}`}
                    className="flex-1 text-sm font-bold hover:underline truncate"
                    style={{ color: isMe ? 'var(--mod-social)' : 'var(--text-strong)' }}>
                    {u?.name ?? u?.handle ?? s.userId.slice(0, 8)}
                  </Link>
                  <span className="text-xs font-extrabold" style={{ color: 'var(--mod-social)' }}>
                    {s._sum.points ?? 0} XP
                  </span>
                </div>
              );
            })}
          </div>

          <div className="clay-card p-5">
            <h2 className="text-sm font-extrabold mb-3" style={{ color: 'var(--text-strong)' }}>Mais Conquistas</h2>
            {topBadges.map((b, i) => {
              const u = badgeUserMap[b.userId];
              const isMe = b.userId === user.id;
              return (
                <div key={b.userId} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-black w-5" style={{ color: 'var(--text-soft)' }}>{i + 1}</span>
                  <Link href={`/social/perfil/${b.userId}`}
                    className="flex-1 text-sm font-bold hover:underline truncate"
                    style={{ color: isMe ? 'var(--mod-social)' : 'var(--text-strong)' }}>
                    {u?.name ?? u?.handle ?? b.userId.slice(0, 8)}
                  </Link>
                  <span className="text-xs font-extrabold" style={{ color: '#FFB020' }}>
                    🏆 {b._count.id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
