'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/user'
import { startOfDay, subDays, isSameDay } from 'date-fns'

function revalidate() {
  revalidatePath('/metas')
  revalidatePath('/')
}

export async function createHabit(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  if (!title) return
  const userId = await getCurrentUserId()
  await prisma.habit.create({
    data: { userId, title, frequency: String(formData.get('frequency') ?? 'daily'), streak: 0 },
  })
  revalidate()
}

export async function deleteHabit(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await prisma.habit.delete({ where: { id } })
  revalidate()
}

/** Marca o hábito como feito hoje (toggle) e recalcula o streak. */
export async function toggleHabitToday(formData: FormData) {
  const habitId = String(formData.get('id') ?? '')
  if (!habitId) return
  const userId = await getCurrentUserId()
  const today = startOfDay(new Date())

  const existing = await prisma.habitLog.findFirst({
    where: { habitId, date: { gte: today } },
  })
  if (existing) {
    await prisma.habitLog.delete({ where: { id: existing.id } })
  } else {
    await prisma.habitLog.create({ data: { habitId, userId, date: new Date() } })
  }

  // Recalcula streak: conta dias consecutivos até hoje com log.
  const logs = await prisma.habitLog.findMany({
    where: { habitId },
    orderBy: { date: 'desc' },
    take: 365,
  })
  const days = logs.map((l) => startOfDay(l.date))
  let streak = 0
  let cursor = startOfDay(new Date())
  // Se não fez hoje, começa a contar a partir de ontem.
  if (!days.some((d) => isSameDay(d, cursor))) cursor = subDays(cursor, 1)
  while (days.some((d) => isSameDay(d, cursor))) {
    streak++
    cursor = subDays(cursor, 1)
  }

  await prisma.habit.update({ where: { id: habitId }, data: { streak } })
  revalidate()
}
