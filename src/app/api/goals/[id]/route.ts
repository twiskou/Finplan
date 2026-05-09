import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getUser(req: NextRequest) {
  const token = req.cookies.get('finplan-token')?.value
  if (!token) return null
  return await verifyToken(token)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, targetAmount, savedAmount, deadline, icon, color, isCompleted } = body

  // We need to fetch the existing goal first to calculate the difference
  const existingGoal = await prisma.savingGoal.findUnique({
    where: { id, userId: payload.userId }
  })

  if (!existingGoal) return NextResponse.json({ error: 'Objectif non trouvé' }, { status: 404 })

  const newSavedAmount = parseFloat(savedAmount)
  const difference = newSavedAmount - existingGoal.savedAmount

  const goal = await prisma.savingGoal.updateMany({
    where: { id, userId: payload.userId },
    data: {
      name,
      targetAmount: parseFloat(targetAmount),
      savedAmount: newSavedAmount,
      deadline: deadline ? new Date(deadline) : null,
      icon,
      color,
      isCompleted: isCompleted || false,
    },
  })

  // If difference > 0, the user added savings. We create an EXPENSE transaction automatically.
  if (difference > 0) {
    const txDate = new Date()
    const txCategory = 'Investissement' // Default category for savings/investments
    
    await prisma.transaction.create({
      data: {
        userId: payload.userId,
        type: 'EXPENSE',
        amount: difference,
        currency: existingGoal.currency,
        category: txCategory,
        description: `Épargne : ${name || existingGoal.name}`,
        date: txDate,
        paymentMethod: 'Automatique',
      }
    })

    // Automatically deduct from this month's budget if a budget for 'Investissement' exists
    await prisma.budget.updateMany({
      where: {
        userId: payload.userId,
        category: txCategory,
        month: txDate.getMonth() + 1,
        year: txDate.getFullYear(),
      },
      data: {
        spent: { increment: difference }
      }
    })
  }

  return NextResponse.json({ goal })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  await prisma.savingGoal.deleteMany({ where: { id, userId: payload.userId } })
  return NextResponse.json({ message: 'Supprimé' })
}
