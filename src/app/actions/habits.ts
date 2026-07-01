'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/user'
import { subDays } from 'date-fns'
import { dayRangeInTimezone } from '@/lib/timezone'

function revalidate() {
  revalidatePath('/metas')
  revalidatePath('/')
}

export async function createHabit(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  if (!title) return
  const user = await getCurrentUser()
  await prisma.habit.create({
    data: { userId: user.id, title, frequency: String(formData.get('frequency') ?? 'daily'), streak: 0 },
  })
  revalidate()
}

export async function deleteHabit(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await prisma.habit.delete({ where: { id } })
  revalidate()
}

/** Marca o hábito como feito hoje (toggle) e recalcula o streak, no dia local do usuário. */
export async function toggleHabitToday(formData: FormData) {
  const habitId = String(formData.get('id') ?? '')
  if (!habitId) return
  const user = await getCurrentUser()
  const { start: today } = dayRangeInTimezone(user.timezone)

  const existing = await prisma.habitLog.findFirst({
    where: { habitId, date: { gte: today } },
  })
  if (existing) {
    await prisma.habitLog.delete({ where: { id: existing.id } })
  } else {
    await prisma.habitLog.create({ data: { habitId, userId: user.id, date: new Date() } })
  }

  // Recalcula streak: conta dias consecutivos até hoje com log (comparando instantes de meia-noite local exatos).
  const logs = await prisma.habitLog.findMany({
    where: { habitId },
    orderBy: { date: 'desc' },
    take: 365,
  })
  const dayTimes = new Set(logs.map((l) => dayRangeInTimezone(user.timezone, l.date).start.getTime()))
  let streak = 0
  let cursor = today
  // Se não fez hoje, começa a contar a partir de ontem.
  if (!dayTimes.has(cursor.getTime())) cursor = subDays(cursor, 1)
  while (dayTimes.has(cursor.getTime())) {
    streak++
    cursor = subDays(cursor, 1)
  }

  await prisma.habit.update({ where: { id: habitId }, data: { streak } })
  revalidate()
}
