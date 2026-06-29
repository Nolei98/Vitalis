import 'server-only';
import { prisma } from '@/lib/prisma';

export const BADGE_LABEL: Record<string, string> = {
  streak_7d:  '🔥 7 dias seguidos',
  streak_30d: '🏆 30 dias seguidos',
  hours_10:   '⏱️ 10h registradas',
  hours_100:  '💎 100h registradas',
  checkin_10: '📸 10 check-ins com foto',
};

export const SQUAD_TYPE_META: Record<string, { emoji: string; label: string; color: string }> = {
  estudos:  { emoji: '📚', label: 'Estudos',  color: '#5B8DEF' },
  academia: { emoji: '🏋️', label: 'Academia', color: '#2BC48A' },
  compras:  { emoji: '🛒', label: 'Compras',  color: '#FFB020' },
  metas:    { emoji: '🎯', label: 'Metas',    color: '#FF6FB5' },
};

/** Returns friendships of `userId` (accepted) with the other user's profile. */
export async function getFriends(userId: string) {
  const rows = await prisma.friendship.findMany({
    where: {
      status: 'accepted',
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: {
      requester: { select: { id: true, name: true, handle: true, avatarUrl: true, bio: true } },
      addressee: { select: { id: true, name: true, handle: true, avatarUrl: true, bio: true } },
    },
  });
  return rows.map((f) => ({
    friendshipId: f.id,
    friend: f.requesterId === userId ? f.addressee : f.requester,
  }));
}

export async function getPendingRequests(userId: string) {
  return prisma.friendship.findMany({
    where: { addresseeId: userId, status: 'pending' },
    include: { requester: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
  });
}

export async function getSentRequests(userId: string) {
  return prisma.friendship.findMany({
    where: { requesterId: userId, status: 'pending' },
    include: { addressee: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
  });
}

export async function getUserSquads(userId: string) {
  return prisma.squad.findMany({
    where: { members: { some: { userId } } },
    include: {
      _count: { select: { members: true, messages: true } },
      members: { where: { userId }, select: { role: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getSquadLeaderboard(squadId: string, period: string) {
  return prisma.userScore.findMany({
    where: { squadId, period },
    include: { user: { select: { id: true, name: true, handle: true, avatarUrl: true } } },
    orderBy: { points: 'desc' },
    take: 20,
  });
}

export async function currentWeekKey() {
  const now = new Date();
  const d = new Date(now);
  d.setDate(now.getDate() - now.getDay());
  return `${d.getFullYear()}-W${String(Math.ceil(d.getDate() / 7)).padStart(2, '0')}`;
}

export function dmKey(a: string, b: string) {
  return [a, b].sort().join('_');
}

export async function getPublicProfile(userId: string) {
  const [user, sessions, badges, squads] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, handle: true, avatarUrl: true, bio: true, createdAt: true },
    }),
    prisma.activitySession.findMany({
      where: { userId },
      select: { type: true, durationMin: true, createdAt: true },
    }),
    prisma.badge.findMany({ where: { userId } }),
    prisma.squad.findMany({
      where: { members: { some: { userId } } },
      select: { id: true, name: true, coverEmoji: true, type: true },
    }),
  ]);
  const totalMin = sessions.reduce((a, s) => a + (s.durationMin ?? 0), 0);
  return { user, sessions: sessions.length, totalMin, badges, squads };
}
