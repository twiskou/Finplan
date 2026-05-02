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
  const { type, amount, currency, category, description, date, paymentMethod } = body

  const existing = await prisma.transaction.findFirst({ where: { id, userId: payload.userId } })
  if (!existing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Revert old budget if expense
  if (existing.type === 'EXPENSE') {
    const d = new Date(existing.date)
    await prisma.budget.updateMany({
      where: { userId: payload.userId, category: existing.category, month: d.getMonth() + 1, year: d.getFullYear() },
      data: { spent: { decrement: existing.amount } },
    })
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: { type, amount: parseFloat(amount), currency, category, description, date: new Date(date), paymentMethod },
  })

  // Apply new budget if expense
  if (type === 'EXPENSE') {
    const d = new Date(date)
    await prisma.budget.updateMany({
      where: { userId: payload.userId, category, month: d.getMonth() + 1, year: d.getFullYear() },
      data: { spent: { increment: parseFloat(amount) } },
    })
  }

  return NextResponse.json({ transaction: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  const existing = await prisma.transaction.findFirst({ where: { id, userId: payload.userId } })
  if (!existing) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Revert budget
  if (existing.type === 'EXPENSE') {
    const d = new Date(existing.date)
    await prisma.budget.updateMany({
      where: { userId: payload.userId, category: existing.category, month: d.getMonth() + 1, year: d.getFullYear() },
      data: { spent: { decrement: existing.amount } },
    })
  }

  await prisma.transaction.delete({ where: { id } })
  return NextResponse.json({ message: 'Supprimé' })
}
