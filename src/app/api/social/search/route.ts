import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';

export async function GET(req: NextRequest) {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      id: { not: uid },
      OR: [
        { name:   { contains: q } },
        { handle: { contains: q } },
        { email:  { contains: q } },
      ],
    },
    select: { id: true, name: true, handle: true, bio: true, avatarUrl: true },
    take: 10,
  });

  return NextResponse.json({ users });
}
