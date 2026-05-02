import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getUser(req: NextRequest) {
  const token = req.cookies.get('finplan-token')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  return payload
}

export async function GET(req: NextRequest) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined
  const type = searchParams.get('type')
  const category = searchParams.get('category')

  const where: Record<string, unknown> = { userId: payload.userId }
  if (type) where.type = type
  if (category) where.category = category
  if (month && year) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)
    where.date = { gte: start, lte: end }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({ transactions })
}

export async function POST(req: NextRequest) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const { type, amount, currency, category, description, date, paymentMethod } = body

  if (!type || !amount || !category || !date) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: payload.userId,
      type,
      amount: parseFloat(amount),
      currency: currency || 'DZD',
      category,
      description,
      date: new Date(date),
      paymentMethod,
    },
  })

  // Update budget spent if expense
  if (type === 'EXPENSE') {
    const d = new Date(date)
    await prisma.budget.updateMany({
      where: {
        userId: payload.userId,
        category,
        month: d.getMonth() + 1,
        year: d.getFullYear(),
      },
      data: { spent: { increment: parseFloat(amount) } },
    })
  }

  return NextResponse.json({ transaction }, { status: 201 })
}
