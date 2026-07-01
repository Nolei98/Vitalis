'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/user'

export async function addWater(amount: number) {
  const userId = await getCurrentUserId()
  await prisma.waterLog.create({ data: { userId, amount } })
  revalidatePath('/')
  revalidatePath('/agua')
}
