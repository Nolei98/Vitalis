'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/user'
import { pushClickUpStatus } from '@/lib/integrations/connectors/clickup'

function revalidate() {
  revalidatePath('/')
  revalidatePath('/tarefas')
}

export async function toggleTask(taskId: string, isCompleted: boolean) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: isCompleted ? 'completed' : 'pending',
      completedAt: isCompleted ? new Date() : null,
    },
  })
  // Bidirecional: reflete a mudança no ClickUp se a task veio de lá.
  if (task.source === 'clickup' && task.externalId) {
    const userId = await getCurrentUserId()
    await pushClickUpStatus(userId, task.externalId, isCompleted)
  }
  revalidate()
}

export async function createTask(title: string, project: string, priority = 0, due?: string) {
  const userId = await getCurrentUserId()
  await prisma.task.create({
    data: {
      userId,
      title,
      project,
      priority,
      due: due ? new Date(due) : null,
      status: 'pending',
      source: 'internal',
    },
  })
  revalidate()
}

export async function createTaskForm(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  if (!title) return
  const project = String(formData.get('project') ?? '')
  const priority = Number(formData.get('priority') ?? 0)
  const due = String(formData.get('due') ?? '')
  await createTask(title, project, priority, due || undefined)
}

export async function deleteTask(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await prisma.task.delete({ where: { id } })
  revalidate()
}

export async function setPriority(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const priority = Number(formData.get('priority') ?? 0)
  if (!id) return
  await prisma.task.update({ where: { id }, data: { priority } })
  revalidate()
}
