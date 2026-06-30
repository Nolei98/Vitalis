import 'server-only';
import { getDecrypted } from '@/lib/integrations/vault';

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
}

/** Envia mensagem para um webhook do Discord. Lança em erro HTTP. */
export async function sendToWebhook(
  webhookUrl: string,
  payload: { content?: string; embeds?: DiscordEmbed[]; username?: string },
): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'LifeOS', ...payload }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Discord webhook ${res.status}: ${body.slice(0, 200)}`);
  }
}

/** Envia usando o webhook salvo no cofre para o usuário atual. No-op se não configurado. */
export async function notifyDiscord(
  payload: { content?: string; embeds?: DiscordEmbed[] },
  userId?: string,
): Promise<boolean> {
  const integ = await getDecrypted('discord', userId);
  if (!integ?.webhookUrl) return false;
  await sendToWebhook(integ.webhookUrl, payload);
  return true;
}

export const COLORS = {
  purple: 0x9871f5,
  pink: 0xffb6b9,
  green: 0xa8e6cf,
  amber: 0xfce38a,
  blue: 0x38bdf8,
} as const;
