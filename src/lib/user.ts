import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';

/**
 * Multi-user com sessão local (perfis estilo Vitalis).
 *
 * getCurrentUser() resolve o usuário pela sessão (cookie assinado). Sem sessão
 * válida, faz fallback ao primeiro usuário do banco (transição do modo
 * single-user; o middleware normalmente já redireciona p/ /login antes disso).
 * Memoizado por render com React cache().
 */
export const getCurrentUser = cache(async () => {
  const sessionId = await getSessionUserId();
  if (sessionId) {
    const u = await prisma.user.findUnique({ where: { id: sessionId } });
    if (u) return u;
  }

  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { name: 'João', email: 'joao@example.com' },
    });
  }
  return user;
});

/** Apenas o id, para actions que só precisam escopar queries. */
export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  return user.id;
}
