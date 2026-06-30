'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { sha256 } from '@/lib/crypto';
import { createSession, destroySession } from '@/lib/session';

export interface AuthState {
  error?: string;
}

function normEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

/**
 * Registra um novo perfil (ou "adota" um usuário pré-existente sem senha, como o
 * placeholder do modo single-user). Cria a sessão e redireciona para o dashboard.
 */
export async function registerUser(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get('name') || '').trim();
  const email = normEmail(String(formData.get('email') || ''));
  const password = String(formData.get('password') || '');

  if (!name || !email || !password) return { error: 'Preencha nome, e-mail e senha.' };
  if (password.length < 4) return { error: 'A senha precisa ter ao menos 4 caracteres.' };

  const existing = await prisma.user.findUnique({ where: { email } });
  let userId: string;

  if (existing) {
    if (existing.passwordHash) return { error: 'Este e-mail já está cadastrado.' };
    // Usuário sem senha (placeholder/single-user): adota a conta.
    const u = await prisma.user.update({
      where: { id: existing.id },
      data: { name, passwordHash: sha256(password) },
    });
    userId = u.id;
  } else {
    const u = await prisma.user.create({
      data: { name, email, passwordHash: sha256(password) },
    });
    userId = u.id;
  }

  await createSession(userId);
  redirect('/');
}

/** Login por e-mail + senha. Cria a sessão e redireciona para o dashboard. */
export async function loginUser(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = normEmail(String(formData.get('email') || ''));
  const password = String(formData.get('password') || '');

  if (!email || !password) return { error: 'Informe e-mail e senha.' };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return { error: 'Usuário não encontrado.' };
  if (user.passwordHash !== sha256(password)) return { error: 'Senha incorreta.' };

  await createSession(user.id);
  redirect('/');
}

/** Encerra a sessão atual. */
export async function logoutUser(): Promise<void> {
  await destroySession();
  redirect('/login');
}
