import { UserProfile } from '../types';
import { apiConfigured, apiRegister, apiLogin } from './apiService';
import { restoreSnapshot, scheduleSync } from './syncService';

const KEY_USERS = 'nutriflow_users';
const KEY_CURRENT = 'nutriflow_current_user';

/** SHA-256 em hex (Web Crypto). Adequado apenas para app local/educacional, sem backend. */
async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function loadUsers(): UserProfile[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_USERS) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: UserProfile[]): void {
  localStorage.setItem(KEY_USERS, JSON.stringify(users));
}

/** Remove o hash de senha da cópia que vai para a sessão. */
function sanitize(u: UserProfile): UserProfile {
  const { passwordHash, ...rest } = u;
  return rest;
}

function setCurrent(u: UserProfile): UserProfile {
  const clean = sanitize(u);
  localStorage.setItem(KEY_CURRENT, JSON.stringify(clean));
  return clean;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<UserProfile> {
  const email = normalizeEmail(input.email);
  if (!email || !input.password) throw new Error('Informe e-mail e senha.');

  // Backend (planilha) configurado: a planilha é a fonte da verdade.
  if (apiConfigured()) {
    const { user, data } = await apiRegister(input.name, email, input.password);
    restoreSnapshot(email, data);
    return setCurrent(user);
  }

  // Fallback local (sem backend): mantém a base de usuários no localStorage.
  const users = loadUsers();
  if (users.some(u => normalizeEmail(u.email) === email)) {
    throw new Error('Este e-mail já está cadastrado.');
  }
  const user: UserProfile = {
    name: input.name?.trim() || 'Usuário Vitalis',
    email,
    passwordHash: await sha256(input.password),
  };
  users.push(user);
  saveUsers(users);
  return setCurrent(user);
}

export async function login(email: string, password: string): Promise<UserProfile> {
  const normalized = normalizeEmail(email);

  if (apiConfigured()) {
    const { user, data } = await apiLogin(normalized, password);
    restoreSnapshot(normalized, data);
    return setCurrent(user);
  }

  const users = loadUsers();
  const user = users.find(u => normalizeEmail(u.email) === normalized);
  if (!user) throw new Error('Usuário não encontrado.');

  const hash = await sha256(password);
  if (user.passwordHash !== hash) throw new Error('Senha incorreta.');

  return setCurrent(user);
}

/** Conta demo (botão "Acesso Free"): não exige senha e não entra na base de usuários. */
export function loginAsGuest(name?: string, email?: string): UserProfile {
  const guest: UserProfile = {
    name: name?.trim() || 'Visitante Vitalis',
    email: normalizeEmail(email || 'visitante@vitalis.app'),
  };
  return setCurrent(guest);
}

export function getCurrentUser(): UserProfile | null {
  try {
    return JSON.parse(localStorage.getItem(KEY_CURRENT) || 'null');
  } catch {
    return null;
  }
}

/** Persiste mudanças de perfil (dados físicos, metas) na sessão e na base de usuários. */
export function updateUser(u: UserProfile): UserProfile {
  const users = loadUsers();
  const idx = users.findIndex(x => normalizeEmail(x.email) === normalizeEmail(u.email));
  if (idx >= 0) {
    // Preserva o passwordHash existente; aplica os novos campos por cima.
    users[idx] = { ...users[idx], ...u, passwordHash: users[idx].passwordHash };
    saveUsers(users);
  }
  const current = setCurrent(u);
  scheduleSync(); // envia o perfil atualizado para a planilha (se configurada).
  return current;
}

export function logout(): void {
  localStorage.removeItem(KEY_CURRENT);
}
