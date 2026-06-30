'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addWater(amount: number) {
  const user = await prisma.user.findFirst()
  if (!user) return
  await prisma.waterLog.create({
    data: {
      userId: user.id,
      amount
    }
  })
  revalidatePath('/')
  revalidatePath('/agua')
}
