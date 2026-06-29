import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const uid = await getSessionUserId();
  if (!uid) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key') ?? '';
  let since = searchParams.get('since') ? new Date(searchParams.get('since')!) : new Date(Date.now() - 120_000);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch { closed = true; }
      };

      send({ type: 'ping' });

      const poll = async () => {
        if (closed) return;
        try {
          const where: Prisma.MessageWhereInput = { createdAt: { gt: since } };

          if (key.startsWith('squad-')) {
            where.squadId = key.slice(6);
          } else if (key.startsWith('dm-')) {
            where.dmKey = key.slice(3);
          } else {
            return;
          }

          const msgs = await prisma.message.findMany({
            where,
            include: {
              sender: { select: { id: true, name: true, avatarUrl: true, handle: true } },
              attachments: true,
              reactions: { include: { user: { select: { id: true, name: true } } } },
              replyTo: { include: { sender: { select: { id: true, name: true } } } },
            },
            orderBy: { createdAt: 'asc' },
            take: 50,
          });

          if (msgs.length > 0) {
            // Advance since so next poll only fetches newer messages
            since = msgs.at(-1)!.createdAt;
            send({ type: 'messages', data: msgs });
          }
        } catch { /* DB error during streaming — skip tick */ }
      };

      const interval = setInterval(poll, 2000);

      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
