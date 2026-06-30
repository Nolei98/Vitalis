'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSessionUserId } from '@/lib/session';

async function me() {
  const id = await getSessionUserId();
  if (!id) redirect('/login');
  return id;
}

function dmKey(a: string, b: string) {
  return [a, b].sort().join('_');
}

// ── Perfil ────────────────────────────────────────────────────────────────────

export async function updateProfile(_prev: unknown, form: FormData) {
  const uid = await me();
  const name = form.get('name') as string;
  const handle = (form.get('handle') as string).replace(/[^a-z0-9_]/gi, '').toLowerCase();
  const bio = form.get('bio') as string;
  try {
    await prisma.user.update({
      where: { id: uid },
      data: { name: name || undefined, handle: handle || undefined, bio: bio || undefined },
    });
    revalidatePath('/social');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Handle já em uso.' };
  }
}

// ── Amizades ──────────────────────────────────────────────────────────────────

export async function sendFriendRequest(addresseeId: string) {
  const uid = await me();
  if (uid === addresseeId) return { ok: false, error: 'Não pode se adicionar.' };
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: uid, addresseeId },
        { requesterId: addresseeId, addresseeId: uid },
      ],
    },
  });
  if (existing) return { ok: false, error: 'Pedido já existe.' };
  await prisma.friendship.create({ data: { requesterId: uid, addresseeId } });
  revalidatePath('/social/amigos');
  return { ok: true };
}

export async function respondFriendRequest(friendshipId: string, accept: boolean) {
  const uid = await me();
  const f = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!f || f.addresseeId !== uid) return { ok: false };
  if (accept) {
    await prisma.friendship.update({ where: { id: friendshipId }, data: { status: 'accepted' } });
  } else {
    await prisma.friendship.delete({ where: { id: friendshipId } });
  }
  revalidatePath('/social/amigos');
  return { ok: true };
}

export async function removeFriend(friendshipId: string) {
  const uid = await me();
  const f = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!f || (f.requesterId !== uid && f.addresseeId !== uid)) return { ok: false };
  await prisma.friendship.delete({ where: { id: friendshipId } });
  revalidatePath('/social/amigos');
  return { ok: true };
}

export async function blockUser(targetId: string) {
  const uid = await me();
  await prisma.friendship.upsert({
    where: { requesterId_addresseeId: { requesterId: uid, addresseeId: targetId } },
    create: { requesterId: uid, addresseeId: targetId, status: 'blocked' },
    update: { status: 'blocked' },
  });
  revalidatePath('/social/amigos');
  return { ok: true };
}

// ── Squads ────────────────────────────────────────────────────────────────────

export async function createSquad(_prev: unknown, form: FormData) {
  const uid = await me();
  const name = (form.get('name') as string).trim();
  const type = form.get('type') as string;
  const description = (form.get('description') as string | null)?.trim() || null;
  const coverEmoji = (form.get('coverEmoji') as string) || '🏆';
  if (!name) return { ok: false, error: 'Nome obrigatório.' };
  const squad = await prisma.squad.create({
    data: {
      name, type, description, coverEmoji, ownerId: uid,
      members: { create: { userId: uid, role: 'admin' } },
    },
  });
  revalidatePath('/social');
  redirect(`/social/squad/${squad.id}`);
}

export async function joinSquadByCode(inviteCode: string) {
  const uid = await me();
  const squad = await prisma.squad.findUnique({ where: { inviteCode } });
  if (!squad) return { ok: false, error: 'Código inválido.' };
  const already = await prisma.squadMember.findUnique({
    where: { squadId_userId: { squadId: squad.id, userId: uid } },
  });
  if (already) return { ok: false, error: 'Já é membro.' };
  await prisma.squadMember.create({ data: { squadId: squad.id, userId: uid } });
  revalidatePath('/social');
  redirect(`/social/squad/${squad.id}`);
}

export async function leaveSquad(squadId: string) {
  const uid = await me();
  await prisma.squadMember.deleteMany({ where: { squadId, userId: uid } });
  revalidatePath('/social');
  redirect('/social');
}

// ── Mensagens ─────────────────────────────────────────────────────────────────

export async function sendMessage(_prev: unknown, form: FormData) {
  const uid = await me();
  const text = (form.get('text') as string).trim();
  const squadId = form.get('squadId') as string | null;
  const toUserId = form.get('toUserId') as string | null;
  const replyToId = form.get('replyToId') as string | null;
  if (!text && !form.get('hasAttachment')) return { ok: false };

  const data: Parameters<typeof prisma.message.create>[0]['data'] = {
    senderId: uid,
    text: text || null,
    replyToId: replyToId || null,
  };

  if (squadId) {
    const member = await prisma.squadMember.findUnique({
      where: { squadId_userId: { squadId, userId: uid } },
    });
    if (!member) return { ok: false, error: 'Não é membro do squad.' };
    data.squadId = squadId;
  } else if (toUserId) {
    data.dmKey = dmKey(uid, toUserId);
  } else {
    return { ok: false };
  }

  await prisma.message.create({ data });
  if (squadId) revalidatePath(`/social/chat/squad-${squadId}`);
  if (toUserId) revalidatePath(`/social/chat/dm-${dmKey(uid, toUserId)}`);
  return { ok: true };
}

export async function toggleReaction(messageId: string, emoji: string) {
  const uid = await me();
  const existing = await prisma.reaction.findUnique({
    where: { messageId_userId_emoji: { messageId, userId: uid, emoji } },
  });
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { messageId, userId: uid, emoji } });
  }
  return { ok: true };
}

// ── Sessões / XP ──────────────────────────────────────────────────────────────

export async function logSession(_prev: unknown, form: FormData) {
  const uid = await me();
  const squadId = (form.get('squadId') as string) || null;
  const type = form.get('type') as string;
  const durationMin = parseInt(form.get('durationMin') as string) || 0;
  const tags = (form.get('tags') as string) || null;
  const notes = (form.get('notes') as string) || null;

  const xp = Math.max(1, Math.floor(durationMin / 5));
  const now = new Date();
  const startedAt = new Date(now.getTime() - durationMin * 60_000);

  await prisma.activitySession.create({
    data: { userId: uid, squadId, type, startedAt, endedAt: now, durationMin, tags, notes, xpEarned: xp },
  });

  if (squadId) {
    const week = currentWeekKey();
    await prisma.userScore.upsert({
      where: { userId_squadId_period: { userId: uid, squadId, period: week } },
      create: { userId: uid, squadId, period: week, points: xp, streak: 1 },
      update: { points: { increment: xp } },
    });
    await grantBadges(uid);
    revalidatePath(`/social/squad/${squadId}`);
  }
  revalidatePath('/social');
  return { ok: true, xp };
}

function currentWeekKey() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return `${start.getFullYear()}-W${String(Math.ceil((start.getDate()) / 7)).padStart(2, '0')}`;
}

async function grantBadges(userId: string) {
  const totalMin = await prisma.activitySession.aggregate({
    where: { userId },
    _sum: { durationMin: true },
  });
  const mins = totalMin._sum.durationMin ?? 0;
  const badges: string[] = [];
  if (mins >= 10 * 60) badges.push('hours_10');
  if (mins >= 100 * 60) badges.push('hours_100');

  const sessions = await prisma.activitySession.count({ where: { userId, proofImageUrl: { not: null } } });
  if (sessions >= 10) badges.push('checkin_10');

  for (const type of badges) {
    await prisma.badge.upsert({
      where: { userId_type: { userId, type } },
      create: { userId, type },
      update: {},
    });
  }
}

// ── Lista de compras ──────────────────────────────────────────────────────────

export async function addShoppingItem(_prev: unknown, form: FormData) {
  const uid = await me();
  const squadId = form.get('squadId') as string;
  const name = (form.get('name') as string).trim();
  const valor = parseFloat(form.get('valor') as string) || null;
  if (!name) return { ok: false };
  await prisma.shoppingItem.create({ data: { squadId, name, valor } });
  revalidatePath(`/social/squad/${squadId}`);
  return { ok: true };
}

export async function toggleShoppingItem(itemId: string, squadId: string) {
  const uid = await me();
  const item = await prisma.shoppingItem.findUnique({ where: { id: itemId } });
  if (!item) return { ok: false };
  await prisma.shoppingItem.update({
    where: { id: itemId },
    data: { bought: !item.bought, boughtById: !item.bought ? uid : null },
  });
  revalidatePath(`/social/squad/${squadId}`);
  return { ok: true };
}

// ── Metas do squad ────────────────────────────────────────────────────────────

export async function addSquadGoal(_prev: unknown, form: FormData) {
  const squadId = form.get('squadId') as string;
  const title = (form.get('title') as string).trim();
  const metric = (form.get('metric') as string) || null;
  const target = parseFloat(form.get('target') as string) || null;
  if (!title) return { ok: false };
  await prisma.squadGoal.create({ data: { squadId, title, metric, target } });
  revalidatePath(`/social/squad/${squadId}`);
  return { ok: true };
}

// ── Desafios ──────────────────────────────────────────────────────────────────

export async function addChallenge(_prev: unknown, form: FormData) {
  const squadId = form.get('squadId') as string;
  const title = (form.get('title') as string).trim();
  const metricTarget = parseFloat(form.get('metricTarget') as string) || null;
  const startAt = new Date(form.get('startAt') as string);
  const endAt = new Date(form.get('endAt') as string);
  if (!title) return { ok: false };
  await prisma.challenge.create({ data: { squadId, title, metricTarget, startAt, endAt } });
  revalidatePath(`/social/squad/${squadId}`);
  return { ok: true };
}
