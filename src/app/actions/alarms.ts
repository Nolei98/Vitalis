'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/user'

export async function createAlarm(formData: FormData) {
  const label = String(formData.get('label') ?? '').trim()
  const time = String(formData.get('time') ?? '').trim()
  if (!label || !time) return
  const channels = formData.getAll('channels').map(String)
  const userId = await getCurrentUserId()
  await prisma.alarm.create({
    data: {
      userId,
      label,
      time,
      recurrence: String(formData.get('recurrence') ?? 'daily'),
      type: String(formData.get('type') ?? 'generic'),
      channels: (channels.length ? channels : ['app']).join(','),
    },
  })
  revalidatePath('/alarmes')
}

export async function deleteAlarm(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await prisma.alarm.delete({ where: { id } })
  revalidatePath('/alarmes')
}
