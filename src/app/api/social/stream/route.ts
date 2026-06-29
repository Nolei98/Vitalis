import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

// SSE endpoint: GET /api/social/stream?key=squad-<id>|dm-<key>&since=<iso>
export async function GET(req: NextRequest) {
  const uid = await getSessionUserId();
  if (!uid) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key') ?? '';
  const since = searchParams.get('since') ? new Date(searchParams.get('since')!) : new Date(0);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Send initial ping
      send({ type: 'ping' });

      const poll = async () => {
        try {
          const where: Prisma.MessageWhereInput = {
            createdAt: { gt: since },
          };

          if (key.startsWith('squad-')) {
            where.squadId = key.slice(6);
          } else if (key.startsWith('dm-')) {
            where.dmKey = key.slice(3);
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
            send({ type: 'messages', data: msgs });
          }
        } catch {
          // DB error during streaming — skip
        }
      };

      // Poll every 3 seconds
      const interval = setInterval(poll, 3000);

      // Clean up when client disconnects
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
