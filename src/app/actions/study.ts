'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentUserId, getCurrentUser } from '@/lib/user'
import { dayRangeInTimezone } from '@/lib/timezone'
import type { StudySession, StudySettings } from '@prisma/client'

function revalidate() {
  revalidatePath('/estudos')
  revalidatePath('/')
}

async function requireOwnSession(id: string, userId: string): Promise<StudySession> {
  const s = await prisma.studySession.findUnique({ where: { id } })
  if (!s || s.userId !== userId) throw new Error('Sessão não encontrada')
  return s
}

export async function getOrCreateSettings(userId: string): Promise<StudySettings> {
  const existing = await prisma.studySettings.findUnique({ where: { userId } })
  if (existing) return existing
  return prisma.studySettings.create({ data: { userId } })
}

export async function getStudySettings(): Promise<StudySettings> {
  const userId = await getCurrentUserId()
  return getOrCreateSettings(userId)
}

export async function upsertStudySettings(formData: FormData) {
  const userId = await getCurrentUserId()
  const data = {
    workMin: Math.max(Number(formData.get('workMin') ?? 25), 1),
    shortBreakMin: Math.max(Number(formData.get('shortBreakMin') ?? 5), 1),
    longBreakMin: Math.max(Number(formData.get('longBreakMin') ?? 15), 1),
    cyclesPerLong: Math.max(Number(formData.get('cyclesPerLong') ?? 4), 1),
    autoStartBreak: formData.get('autoStartBreak') === 'on',
    autoStartWork: formData.get('autoStartWork') === 'on',
    soundOn: formData.get('soundOn') === 'on',
  }
  await prisma.studySettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  })
  revalidate()
}

export async function listSubjects() {
  const userId = await getCurrentUserId()
  return prisma.studySubject.findMany({ where: { userId }, orderBy: { name: 'asc' } })
}

export async function createSubject(formData: FormData) {
  const userId = await getCurrentUserId()
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return
  const color = String(formData.get('color') ?? '').trim() || null
  await prisma.studySubject.create({ data: { userId, name, color } })
  revalidate()
}

export async function startSession(input: {
  subjectId?: string
  label?: string
  sourceType: string
  sourceId?: string
}): Promise<StudySession> {
  const userId = await getCurrentUserId()
  const settings = await getOrCreateSettings(userId)
  const session = await prisma.studySession.create({
    data: {
      userId,
      subjectId: input.subjectId || null,
      label: input.label || null,
      sourceType: input.sourceType,
      sourceId: input.sourceId || null,
      workMin: settings.workMin,
      shortBreakMin: settings.shortBreakMin,
      longBreakMin: settings.longBreakMin,
      cyclesPerLong: settings.cyclesPerLong,
    },
  })
  revalidate()
  return session
}

/** Usado pelos botões "Estudar agora" da Agenda/Tarefas/Metas — cria a sessão e leva pro timer. */
export async function startSessionAction(formData: FormData) {
  const sourceType = String(formData.get('sourceType') ?? 'manual')
  const sourceId = String(formData.get('sourceId') ?? '').trim() || undefined
  const label = String(formData.get('label') ?? '').trim() || undefined
  const subjectId = String(formData.get('subjectId') ?? '').trim() || undefined
  const session = await startSession({ subjectId, label, sourceType, sourceId })
  redirect(`/estudos?session=${session.id}`)
}

/** Persiste progresso nas transições (pausa/retomada/conclusão) — não a cada tick. */
export async function pauseSession(id: string, focusDelta = 0, breakDelta = 0) {
  const userId = await getCurrentUserId()
  await requireOwnSession(id, userId)
  await prisma.studySession.update({
    where: { id },
    data: { status: 'paused', focusSeconds: { increment: Math.max(focusDelta, 0) }, breakSeconds: { increment: Math.max(breakDelta, 0) } },
  })
  revalidate()
}

export async function resumeSession(id: string) {
  const userId = await getCurrentUserId()
  await requireOwnSession(id, userId)
  await prisma.studySession.update({ where: { id }, data: { status: 'running' } })
  revalidate()
}

export async function logCycle(id: string, focusDelta: number, breakDelta: number, completedCycles: number) {
  const userId = await getCurrentUserId()
  await requireOwnSession(id, userId)
  await prisma.studySession.update({
    where: { id },
    data: {
      focusSeconds: { increment: Math.max(focusDelta, 0) },
      breakSeconds: { increment: Math.max(breakDelta, 0) },
      completedCycles,
    },
  })
  revalidate()
}

export async function completeSession(id: string, focusDelta = 0, breakDelta = 0, completedCycles?: number) {
  const userId = await getCurrentUserId()
  const s = await requireOwnSession(id, userId)
  await prisma.studySession.update({
    where: { id },
    data: {
      status: 'completed',
      endedAt: new Date(),
      focusSeconds: { increment: Math.max(focusDelta, 0) },
      breakSeconds: { increment: Math.max(breakDelta, 0) },
      completedCycles: completedCycles ?? s.completedCycles,
    },
  })
  revalidate()
}

export async function cancelSession(id: string, focusDelta = 0, breakDelta = 0) {
  const userId = await getCurrentUserId()
  await requireOwnSession(id, userId)
  await prisma.studySession.update({
    where: { id },
    data: {
      status: 'canceled',
      endedAt: new Date(),
      focusSeconds: { increment: Math.max(focusDelta, 0) },
      breakSeconds: { increment: Math.max(breakDelta, 0) },
    },
  })
  revalidate()
}

export async function getActiveSession(): Promise<StudySession | null> {
  const userId = await getCurrentUserId()
  return prisma.studySession.findFirst({
    where: { userId, status: { in: ['running', 'paused'] } },
    orderBy: { startedAt: 'desc' },
  })
}

export async function todayFocusMinutes(): Promise<number> {
  const user = await getCurrentUser()
  const { start } = dayRangeInTimezone(user.timezone)
  const sessions = await prisma.studySession.findMany({ where: { userId: user.id, startedAt: { gte: start } } })
  return Math.round(sessions.reduce((a, s) => a + s.focusSeconds, 0) / 60)
}

export interface StudyReport {
  totalFocusSeconds: number
  bySubject: { name: string; seconds: number }[]
  byDay: { day: string; seconds: number }[]
  bySource: { source: string; seconds: number }[]
  sessions: (StudySession & { subject: { name: string; color: string | null } | null })[]
}

const SOURCE_LABEL: Record<string, string> = {
  manual: 'Manual', calendar: 'Agenda', task: 'Tarefa', goal: 'Meta',
}

export async function getStudyReport(from: Date, to: Date): Promise<StudyReport> {
  const userId = await getCurrentUserId()
  const sessions = await prisma.studySession.findMany({
    where: { userId, startedAt: { gte: from, lte: to } },
    include: { subject: { select: { name: true, color: true } } },
    orderBy: { startedAt: 'desc' },
  })

  const bySubject = new Map<string, number>()
  const byDay = new Map<string, number>()
  const bySource = new Map<string, number>()
  for (const s of sessions) {
    const subjName = s.subject?.name ?? s.label ?? 'Sem matéria'
    bySubject.set(subjName, (bySubject.get(subjName) ?? 0) + s.focusSeconds)
    const day = s.startedAt.toISOString().slice(0, 10)
    byDay.set(day, (byDay.get(day) ?? 0) + s.focusSeconds)
    const srcLabel = SOURCE_LABEL[s.sourceType] ?? s.sourceType
    bySource.set(srcLabel, (bySource.get(srcLabel) ?? 0) + s.focusSeconds)
  }

  return {
    totalFocusSeconds: sessions.reduce((a, s) => a + s.focusSeconds, 0),
    bySubject: [...bySubject.entries()].map(([name, seconds]) => ({ name, seconds })).sort((a, b) => b.seconds - a.seconds),
    byDay: [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([day, seconds]) => ({ day, seconds })),
    bySource: [...bySource.entries()].map(([source, seconds]) => ({ source, seconds })).sort((a, b) => b.seconds - a.seconds),
    sessions,
  }
}
