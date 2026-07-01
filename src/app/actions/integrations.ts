'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { saveIntegration, disconnect, type Provider } from '@/lib/integrations/vault';
import { notifyDiscord, COLORS } from '@/lib/integrations/connectors/discord';

const urlSchema = z.string().url();

export async function saveGoogleIcalUrl(formData: FormData) {
  const url = String(formData.get('icalUrl') ?? '').trim();
  if (url.startsWith('••')) return;
  const parsed = urlSchema.safeParse(url);
  if (!parsed.success) return;
  await saveIntegration('google', { icalUrl: parsed.data, label: 'Google Calendar' });
  revalidatePath('/conexoes');
}

export async function saveCanvasUrl(formData: FormData) {
  const url = String(formData.get('icalUrl') ?? '').trim();
  if (url.startsWith('••')) return; // valor mascarado, sem alteração
  const parsed = urlSchema.safeParse(url);
  if (!parsed.success) return;
  await saveIntegration('canvas', { icalUrl: parsed.data, label: 'Canvas LMS' });
  revalidatePath('/conexoes');
}

export async function saveDiscordWebhook(formData: FormData) {
  const url = String(formData.get('webhookUrl') ?? '').trim();
  if (url.startsWith('••')) return;
  const parsed = urlSchema.safeParse(url);
  if (!parsed.success || !url.includes('discord.com/api/webhooks')) return;
  await saveIntegration('discord', { webhookUrl: parsed.data, label: 'Discord' });
  revalidatePath('/conexoes');
}

export async function saveClickUpToken(formData: FormData) {
  const token = String(formData.get('token') ?? '').trim();
  if (token.startsWith('••')) return;
  if (token.length < 10) return;
  await saveIntegration('clickup', { accessToken: token, label: 'ClickUp', syncCursor: null });
  revalidatePath('/conexoes');
}

export async function disconnectProvider(formData: FormData) {
  const provider = String(formData.get('provider') ?? '') as Provider;
  if (!['google', 'canvas', 'clickup', 'discord'].includes(provider)) return;
  await disconnect(provider);
  revalidatePath('/conexoes');
}

export async function testDiscord() {
  await notifyDiscord({
    embeds: [
      {
        title: '✅ LifeOS conectado',
        description: 'Teste de webhook do Discord funcionando.',
        color: COLORS.green,
      },
    ],
  });
  revalidatePath('/conexoes');
}
