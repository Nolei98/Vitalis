import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';

/**
 * Sessão local leve (perfis estilo Vitalis). Guarda o userId num cookie httpOnly
 * assinado com HMAC-SHA256 (chave AUTH_SECRET). Não usa banco de sessões — o
 * cookie é auto-contido e verificável no servidor.
 *
 * Nota: o middleware só checa a PRESENÇA do cookie (edge, sem node:crypto);
 * a verificação real da assinatura acontece aqui (server) via getSessionUserId.
 */

export const SESSION_COOKIE = 'lifeos_session';
const SECRET = process.env.AUTH_SECRET || 'dev-insecure-secret-change-me';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

function hmac(value: string): string {
  return crypto.createHmac('sha256', SECRET).update(value).digest('hex');
}

function sign(userId: string): string {
  return `${userId}.${hmac(userId)}`;
}

function verify(token: string | undefined): string | null {
  if (!token) return null;
  const i = token.lastIndexOf('.');
  if (i <= 0) return null;
  const userId = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = hmac(userId);
  if (sig.length !== expected.length) return null;
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
  } catch {
    return null;
  }
  return userId;
}

export async function createSession(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  return verify(jar.get(SESSION_COOKIE)?.value);
}
