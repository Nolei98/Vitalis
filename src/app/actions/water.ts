'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser, getCurrentUserId } from '@/lib/user'
import { dayRangeInTimezone } from '@/lib/timezone'

const WATER_GOAL = 2000

export async function addWater(amount: number) {
  const userId = await getCurrentUserId()
  await prisma.waterLog.create({ data: { userId, amount } })
  revalidatePath('/')
  revalidatePath('/agua')
}

export async function saveWaterReminder(data: {
  wakeTime: string
  intervalMin: number
  enabled: boolean
}) {
  const userId = await getCurrentUserId()
  const wake = /^([01]\d|2[0-3]):([0-5]\d)$/.test(data.wakeTime) ? data.wakeTime : null
  const interval = Number.isFinite(data.intervalMin) ? Math.min(Math.max(Math.round(data.intervalMin), 15), 240) : 60
  await prisma.user.update({
    where: { id: userId },
    data: { wakeTime: wake, waterReminderInterval: interval, waterReminderEnabled: data.enabled && !!wake },
  })
  revalidatePath('/agua')
}

/** Total (ml) bebido hoje + meta — usado pelo lembrete no cliente pra saber se já bateu a meta. */
export async function getWaterStatus(): Promise<{ total: number; goal: number }> {
  const user = await getCurrentUser()
  const { start } = dayRangeInTimezone(user.timezone)
  const logs = await prisma.waterLog.findMany({
    where: { userId: user.id, createdAt: { gte: start } },
  })
  return { total: logs.reduce((acc, l) => acc + l.amount, 0), goal: WATER_GOAL }
}
