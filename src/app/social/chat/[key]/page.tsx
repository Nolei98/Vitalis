import { getCurrentUser } from '@/lib/user';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ChatWindow from '@/components/social/ChatWindow';

export const dynamic = 'force-dynamic';

export default async function ChatPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const user = await getCurrentUser();

  let squadId: string | undefined;
  let toUserId: string | undefined;
  let title = 'Chat';
  let where: Prisma.MessageWhereInput = {};

  if (key.startsWith('squad-')) {
    squadId = key.slice(6);
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      include: { members: { where: { userId: user.id } } },
    });
    if (!squad || squad.members.length === 0) notFound();
    title = `${squad.coverEmoji} ${squad.name}`;
    where = { squadId };
  } else if (key.startsWith('dm-')) {
    const dmKey = key.slice(3);
    const [aId, bId] = dmKey.split('<');
    if (![aId, bId].includes(user.id)) notFound();
    toUserId = aId === user.id ? bId : aId;
    const other = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, name: true, handle: true },
    });
    if (!other) notFound();
    title = other.name ?? other.handle ?? 'Usuário';
    where = { dmKey };
  } else {
    notFound();
  }

  const messages = await prisma.message.findMany({
    where,
    include: {
      sender: { select: { id: true, name: true, avatarUrl: true, handle: true } },
      attachments: true,
      reactions: { include: { user: { select: { id: true, name: true } } } },
      replyTo: { include: { sender: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  // Serialize dates
  const serialized = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    replyTo: m.replyTo ? { ...m.replyTo, createdAt: m.replyTo.createdAt.toISOString() } : null,
  }));

  return (
    <div className="flex flex-col h-full page-enter" style={{ height: 'calc(100% - 0px)' }}>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <Link href={squadId ? `/social/squad/${squadId}` : '/social'}
          className="clay-btn px-3 py-1.5 text-xs font-bold"
          style={{ background: 'var(--mod-social-bg)', color: 'var(--mod-social-strong)' }}>
          ←
        </Link>
        <Link href={squadId ? `/social/squad/${squadId}` : '/social/amigos'}
          className="text-sm font-extrabold hover:underline" style={{ color: 'var(--text-strong)' }}>
          {title}
        </Link>
      </div>
      <div className="flex-1 clay-card overflow-hidden mx-4 mb-4 flex flex-col min-h-0">
        <ChatWindow
          chatKey={key}
          squadId={squadId}
          toUserId={toUserId}
          currentUserId={user.id}
          initialMessages={serialized as Parameters<typeof ChatWindow>[0]['initialMessages']}
          title={title}
        />
      </div>
    </div>
  );
}
