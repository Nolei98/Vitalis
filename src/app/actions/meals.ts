'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addMeal(formData: FormData) {
  const type = formData.get('type') as string
  const food = formData.get('food') as string
  const calories = parseInt(formData.get('calories') as string) || null
  const protein = parseInt(formData.get('protein') as string) || null

  if (!type || !food) return

  const user = await prisma.user.findFirst()
  if (!user) return

  await prisma.meal.create({
    data: {
      userId: user.id,
      type,
      food,
      calories,
      protein
    }
  })
  
  revalidatePath('/')
  revalidatePath('/dieta')
}

export async function deleteMeal(id: string) {
  await prisma.meal.delete({ where: { id } })
  revalidatePath('/')
  revalidatePath('/dieta')
}
