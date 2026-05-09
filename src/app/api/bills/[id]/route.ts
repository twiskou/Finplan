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

  const existingBill = await prisma.bill.findUnique({
    where: { id, userId: payload.userId }
  })

  if (!existingBill) {
    return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
  }

  await prisma.bill.updateMany({
    where: { id, userId: payload.userId },
    data: {
      name: body.name,
      amount: parseFloat(body.amount),
      dueDate: new Date(body.dueDate),
      frequency: body.frequency,
      category: body.category,
      isPaid: body.isPaid,
    },
  })

  // Auto-create transaction if marked as paid for the first time
  if (!existingBill.isPaid && body.isPaid) {
    const txDate = new Date(body.dueDate)
    const txCategory = body.category || 'Factures'
    
    await prisma.transaction.create({
      data: {
        userId: payload.userId,
        type: 'EXPENSE',
        amount: parseFloat(body.amount),
        currency: existingBill.currency,
        category: txCategory,
        description: `Paiement facture : ${body.name}`,
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
  await prisma.bill.deleteMany({ where: { id, userId: payload.userId } })
  return NextResponse.json({ message: 'Supprimé' })
}
