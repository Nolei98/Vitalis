import 'server-only';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/crypto';
import { getCurrentUserId } from '@/lib/user';
import type { Integration } from '@prisma/client';

export type Provider = 'google' | 'canvas' | 'clickup' | 'discord';

/** Campos sensíveis guardados criptografados (AES-256-GCM via crypto.ts). */
const SECRET_FIELDS = ['accessToken', 'refreshToken', 'webhookUrl', 'icalUrl'] as const;
type SecretField = (typeof SECRET_FIELDS)[number];

export interface IntegrationInput {
  label?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  webhookUrl?: string | null;
  icalUrl?: string | null;
  scopes?: string | null;
  expiresAt?: Date | null;
  status?: string;
  syncCursor?: string | null;
}

function encryptSecrets(data: IntegrationInput): IntegrationInput {
  const out: IntegrationInput = { ...data };
  for (const f of SECRET_FIELDS) {
    const v = out[f] as string | null | undefined;
    if (v != null && v !== '') out[f] = encrypt(v);
  }
  return out;
}

function decryptRow(row: Integration): Integration {
  const out = { ...row };
  for (const f of SECRET_FIELDS) {
    const v = out[f] as string | null;
    if (v != null && v !== '') (out[f as SecretField] as string) = decrypt(v);
  }
  return out;
}

/** Cria ou atualiza a integração de um provider (single-user: 1 linha por provider). */
export async function saveIntegration(
  provider: Provider,
  data: IntegrationInput,
  userId?: string,
): Promise<Integration> {
  const uid = userId ?? (await getCurrentUserId());
  const enc = encryptSecrets(data);
  const existing = await prisma.integration.findFirst({ where: { userId: uid, provider } });
  if (existing) {
    return prisma.integration.update({
      where: { id: existing.id },
      data: { ...enc, status: enc.status ?? 'connected' },
    });
  }
  return prisma.integration.create({
    data: { userId: uid, provider, ...enc, status: enc.status ?? 'connected' },
  });
}

/** Linha bruta (campos sensíveis ainda criptografados) ou null. */
export async function getIntegration(provider: Provider, userId?: string): Promise<Integration | null> {
  const uid = userId ?? (await getCurrentUserId());
  return prisma.integration.findFirst({ where: { userId: uid, provider } });
}

/** Linha com tokens descriptografados — usar só no servidor (connectors). */
export async function getDecrypted(provider: Provider, userId?: string): Promise<Integration | null> {
  const row = await getIntegration(provider, userId);
  return row ? decryptRow(row) : null;
}

/** Marca status/cursor/lastSync após uma sincronização. */
export async function markSync(
  provider: Provider,
  result: { status: string; syncCursor?: string | null; error?: string },
  userId?: string,
): Promise<void> {
  const uid = userId ?? (await getCurrentUserId());
  const row = await prisma.integration.findFirst({ where: { userId: uid, provider } });
  if (!row) return;
  await prisma.integration.update({
    where: { id: row.id },
    data: {
      status: result.status,
      lastSyncAt: new Date(),
      ...(result.syncCursor !== undefined ? { syncCursor: result.syncCursor } : {}),
    },
  });
}

/** Resumo seguro p/ a UI — sem expor segredos. */
export interface IntegrationView {
  provider: Provider;
  label: string | null;
  status: string;
  connected: boolean;
  lastSyncAt: Date | null;
  hasToken: boolean;
  hasWebhook: boolean;
  hasIcal: boolean;
}

export async function listIntegrations(userId?: string): Promise<IntegrationView[]> {
  const uid = userId ?? (await getCurrentUserId());
  const rows = await prisma.integration.findMany({ where: { userId: uid } });
  return rows.map((r) => ({
    provider: r.provider as Provider,
    label: r.label,
    status: r.status,
    connected: r.status === 'connected',
    lastSyncAt: r.lastSyncAt,
    hasToken: !!r.accessToken,
    hasWebhook: !!r.webhookUrl,
    hasIcal: !!r.icalUrl,
  }));
}

export async function disconnect(provider: Provider, userId?: string): Promise<void> {
  const uid = userId ?? (await getCurrentUserId());
  await prisma.integration.deleteMany({ where: { userId: uid, provider } });
}
