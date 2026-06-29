'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/user'

export async function createRule(formData: FormData) {
  const event = String(formData.get('event') ?? '').trim()
  if (!event) return
  const userId = await getCurrentUserId()
  await prisma.notificationRule.create({
    data: {
      userId,
      event,
      channel: String(formData.get('channel') ?? 'discord'),
      window: String(formData.get('window') ?? '') || null,
      enabled: true,
    },
  })
  revalidatePath('/notificacoes')
}

export async function toggleRule(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  const rule = await prisma.notificationRule.findUnique({ where: { id } })
  if (!rule) return
  await prisma.notificationRule.update({ where: { id }, data: { enabled: !rule.enabled } })
  revalidatePath('/notificacoes')
}

export async function deleteRule(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await prisma.notificationRule.delete({ where: { id } })
  revalidatePath('/notificacoes')
}
