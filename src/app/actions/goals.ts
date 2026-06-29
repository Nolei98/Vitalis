'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/user'

function revalidate() {
  revalidatePath('/metas')
  revalidatePath('/')
}

export async function createGoal(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  if (!title) return
  const userId = await getCurrentUserId()
  await prisma.goal.create({
    data: {
      userId,
      title,
      type: String(formData.get('type') ?? 'short'),
      metric: String(formData.get('metric') ?? '') || null,
      target: formData.get('target') ? Number(formData.get('target')) : null,
      current: 0,
      deadline: formData.get('deadline') ? new Date(String(formData.get('deadline'))) : null,
      status: 'active',
    },
  })
  revalidate()
}

export async function updateGoalProgress(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const current = Number(formData.get('current') ?? 0)
  if (!id) return
  const goal = await prisma.goal.update({ where: { id }, data: { current } })
  if (goal.target && current >= goal.target) {
    await prisma.goal.update({ where: { id }, data: { status: 'done' } })
  }
  revalidate()
}

export async function deleteGoal(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await prisma.goal.delete({ where: { id } })
  revalidate()
}
