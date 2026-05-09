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

  const existingDebt = await prisma.debt.findUnique({
    where: { id, userId: payload.userId }
  })

  if (!existingDebt) {
    return NextResponse.json({ error: 'Dette non trouvée' }, { status: 404 })
  }

  await prisma.debt.updateMany({
    where: { id, userId: payload.userId },
    data: {
      creditor: body.creditor,
      amount: parseFloat(body.amount),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      notes: body.notes,
      isPaid: body.isPaid,
    },
  })

  // Auto-create transaction if marked as paid for the first time
  if (!existingDebt.isPaid && body.isPaid) {
    const txDate = body.dueDate ? new Date(body.dueDate) : new Date()
    const txCategory = 'Dettes'
    
    await prisma.transaction.create({
      data: {
        userId: payload.userId,
        type: 'EXPENSE',
        amount: parseFloat(body.amount),
        currency: existingDebt.currency,
        category: txCategory,
        description: `Remboursement dette : ${body.creditor}`,
        date: txDate,
        paymentMethod: 'Automatique',
      }
    })

    // Also update the budget spent amount for this month and category
    await prisma.budget.updateMany({
      where: {
        userId: payload.userId,
        category: txCategory,
        month: txDate.getMonth() + 1,
        year: txDate.getFullYear(),
      },
      data: { spent: { increment: parseFloat(body.amount) } },
    })
  }

  return NextResponse.json({ message: 'Mis à jour' })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  await prisma.debt.deleteMany({ where: { id, userId: payload.userId } })
  return NextResponse.json({ message: 'Supprimé' })
}
