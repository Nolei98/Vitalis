import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  const uid = await getSessionUserId();
  if (!uid) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  const messageId = form.get('messageId') as string | null;

  if (!file) return NextResponse.json({ error: 'Arquivo ausente.' }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Tipo não permitido.' }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Arquivo muito grande (máx 5 MB).' }, { status: 400 });

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const filename = `${randomBytes(12).toString('hex')}.${ext}`;
  const dest = path.join(process.cwd(), 'public', 'uploads', 'social', filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);

  const url = `/uploads/social/${filename}`;

  if (messageId) {
    await prisma.attachment.create({
      data: { messageId, url, mime: file.type, size: file.size },
    });
  }

  return NextResponse.json({ ok: true, url });
}
