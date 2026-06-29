import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/user';
import { syncToSheets, sheetsConfigured } from '@/lib/integrations/sheets';

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
  if (!sheetsConfigured()) {
    return NextResponse.json({ error: 'SHEETS_API_URL não configurada' }, { status: 503 });
  }
  try {
    const userId = await getCurrentUserId();
    const res = await syncToSheets(userId);
    return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), ...res });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
