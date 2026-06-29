import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';

/**
 * Single-user local: o LifeOS roda para um único dono.
 * getCurrentUser() centraliza o padrão prisma.user.findFirst() que estava
 * espalhado pelas páginas/actions. Memoizado por render com React cache().
 *
 * Se nenhum usuário existir ainda (antes do seed/login), cria um placeholder
 * para que o app não quebre na primeira execução.
 */
export const getCurrentUser = cache(async () => {
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
