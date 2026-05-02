import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getUser(req: NextRequest) {
  const token = req.cookies.get('finplan-token')?.value
  if (!token) return null
  return await verifyToken(token)
}

export async function GET(req: NextRequest) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const debts = await prisma.debt.findMany({
    where: { userId: payload.userId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ debts })
}

export async function POST(req: NextRequest) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const { creditor, amount, currency, dueDate, notes } = body

  if (!creditor || !amount) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

  const debt = await prisma.debt.create({
    data: {
      userId: payload.userId,
      creditor,
      amount: parseFloat(amount),
      currency: currency || 'DZD',
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
    },
  })

  return NextResponse.json({ debt }, { status: 201 })
}
