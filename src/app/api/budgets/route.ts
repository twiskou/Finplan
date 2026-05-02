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

  const { searchParams } = new URL(req.url)
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

  const budgets = await prisma.budget.findMany({
    where: { userId: payload.userId, month, year },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ budgets })
}

export async function POST(req: NextRequest) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const { category, limit, month, year } = body

  if (!category || !limit || !month || !year) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  // Calculate spent from existing transactions
  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59)
  const txs = await prisma.transaction.findMany({
    where: { userId: payload.userId, type: 'EXPENSE', category, date: { gte: start, lte: end } },
  })
  const spent = txs.reduce((sum, t) => sum + t.amount, 0)

  const budget = await prisma.budget.create({
    data: {
      userId: payload.userId,
      category,
      limit: parseFloat(limit),
      spent,
      month: parseInt(month),
      year: parseInt(year),
    },
  })

  return NextResponse.json({ budget }, { status: 201 })
}
