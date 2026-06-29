'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/user';
import { revalidatePath } from 'next/cache';
import { sha256 } from '@/lib/crypto';

async function requireAdmin() {
  const user = await getCurrentUser();
  const isAdmin =
    user.role === 'admin' ||
    (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL);
  if (!isAdmin) throw new Error('Acesso negado');
  return user;
}

export async function adminUpdateUser(
  id: string,
  data: { name?: string; email?: string; role?: string; newPassword?: string }
) {
  const admin = await requireAdmin();
  if (id === admin.id && data.role && data.role !== admin.role) {
    throw new Error('Não é possível alterar seu próprio papel');
  }

  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.email !== undefined) update.email = data.email;
  if (data.role !== undefined) update.role = data.role;
  if (data.newPassword) {
    update.passwordHash = sha256(data.newPassword);
  }

  await prisma.user.update({ where: { id }, data: update });
  revalidatePath('/usuarios');
  return { ok: true };
}

export async function adminDeleteUser(id: string) {
  const admin = await requireAdmin();
  if (id === admin.id) throw new Error('Não é possível deletar sua própria conta aqui');
  await prisma.user.delete({ where: { id } });
  revalidatePath('/usuarios');
  return { ok: true };
}

export async function adminPromoteToAdmin(id: string) {
  await requireAdmin();
  await prisma.user.update({ where: { id }, data: { role: 'admin' } });
  revalidatePath('/usuarios');
  return { ok: true };
}
