import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET /api/social/unread?since=<iso>
// Returns count of messages sent to me (DM or squad) since a given timestamp,
// where I am NOT the sender.
export async function GET(req: NextRequest) {
  const uid = await getSessionUserId();
  if (!uid) return Response.json({ count: 0 });

  const { searchParams } = new URL(req.url);
  const sinceParam = searchParams.get('since');
  const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get squads the user is a member of
  const memberships = await prisma.squadMember.findMany({
    where: { userId: uid },
    select: { squadId: true },
  });
  const squadIds = memberships.map((m) => m.squadId);

  // Get accepted friends to know valid DM keys
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'accepted',
      OR: [{ requesterId: uid }, { addresseeId: uid }],
    },
    select: { requesterId: true, addresseeId: true },
  });
  const dmKeys = friendships.map((f) => {
    const other = f.requesterId === uid ? f.addresseeId : f.requesterId;
    return [uid, other].sort().join('_');
  });

  const count = await prisma.message.count({
    where: {
      senderId: { not: uid },
      createdAt: { gt: since },
      OR: [
        ...(squadIds.length > 0 ? [{ squadId: { in: squadIds } }] : []),
        ...(dmKeys.length > 0 ? [{ dmKey: { in: dmKeys } }] : []),
      ],
    },
  });

  return Response.json({ count });
}
