import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/user';
import { runNotifications } from '@/lib/notify';

export const dynamic = 'force-dynamic';

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  const url = new URL(req.url);
  return auth === `Bearer ${secret}` || url.searchParams.get('secret') === secret;
}

async function handle(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const userId = await getCurrentUserId();
  const result = await runNotifications(userId);
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
