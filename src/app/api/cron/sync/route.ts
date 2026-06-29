import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/user';
import { syncAll } from '@/lib/integrations/connectors';

export const dynamic = 'force-dynamic';

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  const url = new URL(req.url);
  return auth === `Bearer ${secret}` || url.searchParams.get('secret') === secret;
}

async function handle(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const userId = await getCurrentUserId();
  const results = await syncAll(userId);
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), results });
}

export const GET = handle;
export const POST = handle;
