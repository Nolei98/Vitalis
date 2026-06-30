'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getCurrentUserId } from '@/lib/user'

export async function addBudget(formData: FormData) {
  const category = String(formData.get('category') ?? '').trim()
  const limit = parseFloat(String(formData.get('limit') ?? '')) || 0
  if (!category || limit <= 0) return
  const userId = await getCurrentUserId()
  await prisma.budget.create({
    data: { userId, category, limit, period: String(formData.get('period') ?? 'monthly') },
  })
  revalidatePath('/financas')
}

export async function deleteBudget(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return
  await prisma.budget.delete({ where: { id } })
  revalidatePath('/financas')
}

export async function addTransaction(formData: FormData) {
  const accountId = formData.get('accountId') as string
  const kind = formData.get('kind') as string
  const amountStr = formData.get('amount') as string
  const amount = parseFloat(amountStr) || 0
  const category = formData.get('category') as string
  const note = formData.get('note') as string

  if (!accountId || amount <= 0) return

  const userId = await getCurrentUserId()
  const account = await prisma.finAccount.findUnique({ where: { id: accountId } })
  if (!account) return

  const newBalance = kind === 'income' ? account.balance + amount : account.balance - amount

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId,
        accountId,
        kind,
        amount,
        category,
        note
      }
    }),
    prisma.finAccount.update({
      where: { id: accountId },
      data: { balance: newBalance }
    })
  ])
  
  revalidatePath('/')
  revalidatePath('/financas')
}

export async function addVault(formData: FormData) {
  const title = formData.get('title') as string
  const target = parseFloat(formData.get('target') as string) || 0

  if (!title || target <= 0) return

  const userId = await getCurrentUserId()
  await prisma.goal.create({
    data: {
      userId,
      title,
      type: 'vault',
      target,
      current: 0
    }
  })
  
  revalidatePath('/financas')
}

export async function depositToVault(formData: FormData) {
  const vaultId = formData.get('vaultId') as string
  const accountId = formData.get('accountId') as string
  const amount = parseFloat(formData.get('amount') as string) || 0

  if (!vaultId || !accountId || amount <= 0) return

  const account = await prisma.finAccount.findUnique({ where: { id: accountId } })
  const vault = await prisma.goal.findUnique({ where: { id: vaultId } })
  
  if (!account || !vault) return

  await prisma.$transaction([
    prisma.finAccount.update({
      where: { id: accountId },
      data: { balance: account.balance - amount }
    }),
    prisma.goal.update({
      where: { id: vaultId },
      data: { current: vault.current + amount }
    }),
    prisma.transaction.create({
      data: {
        userId: account.userId,
        accountId: accountId,
        amount: amount,
        kind: 'expense',
        category: 'Cofre: ' + vault.title,
        note: 'Transferência para cofre'
      }
    })
  ])

  revalidatePath('/financas')
}
