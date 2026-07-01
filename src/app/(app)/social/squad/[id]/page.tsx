import { getCurrentUser } from '@/lib/user';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { SQUAD_TYPE_META, currentWeekKey, getSquadLeaderboard } from '@/lib/social';
import SquadTabs from '@/components/social/SquadTabs';

export const dynamic = 'force-dynamic';

export default async function SquadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const squad = await prisma.squad.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      squadGoals: { orderBy: { createdAt: 'desc' } },
      challenges: { orderBy: { startAt: 'desc' } },
      shoppingItems: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!squad) notFound();

  const membership = squad.members.find((m) => m.userId === user.id);
  if (!membership) redirect('/social');

  const isAdmin = membership.role === 'admin';
  const week = await currentWeekKey();
  const leaderboard = await getSquadLeaderboard(id, week);

  const recentSessions = await prisma.activitySession.findMany({
    where: { squadId: id },
    include: { user: { select: { id: true, name: true, handle: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const meta = SQUAD_TYPE_META[squad.type] ?? { emoji: '🏆', label: squad.type, color: '#9871F5' };
  const totalSessionMin = recentSessions.reduce((a, s) => a + (s.durationMin ?? 0), 0);

  return (
    <div className="space-y-4 page-enter pb-8 h-full flex flex-col">
      {/* Header */}
      <header className="pt-2 flex items-start gap-3">
        <Link href="/social" className="clay-btn px-3 py-1.5 text-xs font-bold mt-1"
          style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>← Social</Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{squad.coverEmoji}</span>
            <div>
              <h1 className="text-xl font-black truncate" style={{ color: 'var(--text-strong)' }}>{squad.name}</h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${meta.color}18`, color: meta.color }}>
                {meta.emoji} {meta.label}
              </span>
            </div>
          </div>
          {squad.description && (
            <p className="text-sm" style={{ color: 'var(--text-soft)' }}>{squad.description}</p>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <Link href={`/social/chat/squad-${id}`}
            className="clay-btn px-4 py-2 text-sm font-bold text-white"
            style={{ background: 'var(--mod-social)' }}>
            💬 Chat
          </Link>
        </div>
      </header>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Membros', value: squad.members.length, emoji: '👥' },
          { label: 'Sessões', value: recentSessions.length, emoji: '⚡' },
          { label: 'Horas (total)', value: `${Math.floor(totalSessionMin / 60)}h`, emoji: '⏱️' },
          { label: 'Código', value: squad.inviteCode.slice(0, 8) + '…', emoji: '🔗', small: true },
        ].map((s) => (
          <div key={s.label} className="clay-card p-3 text-center"
            style={{ borderTop: `2px solid ${meta.color}` }}>
            <div className="text-lg">{s.emoji}</div>
            <div className={`font-black ${s.small ? 'text-xs' : 'text-lg'}`} style={{ color: 'var(--text-strong)' }}>{s.value}</div>
            <div className="text-[10px] font-bold" style={{ color: 'var(--text-soft)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex-1 min-h-0">
        <SquadTabs
          squadId={id}
          squadType={squad.type}
          squadGoals={squad.squadGoals}
          challenges={squad.challenges.map((c) => ({
            ...c,
            startAt: c.startAt.toISOString(),
            endAt: c.endAt.toISOString(),
            createdAt: c.createdAt.toISOString(),
          }))}
          shoppingItems={squad.shoppingItems}
          members={squad.members.map((m) => ({
            ...m,
            joinedAt: m.joinedAt.toISOString(),
          }))}
          leaderboard={leaderboard.map((s) => ({
            ...s,
            updatedAt: s.updatedAt.toISOString(),
          }))}
          sessions={recentSessions.map((s) => ({
            ...s,
            startedAt: s.startedAt.toISOString(),
            endedAt: s.endedAt?.toISOString() ?? null,
            createdAt: s.createdAt.toISOString(),
          }))}
          currentUserId={user.id}
          isAdmin={isAdmin}
          accentColor={meta.color}
        />
      </div>
    </div>
  );
}
