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

  const bills = await prisma.bill.findMany({
    where: { userId: payload.userId },
    orderBy: { dueDate: 'asc' },
  })
  return NextResponse.json({ bills })
}

export async function POST(req: NextRequest) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const { name, amount, currency, dueDate, frequency, category } = body

  if (!name || !amount || !dueDate || !frequency) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const bill = await prisma.bill.create({
    data: {
      userId: payload.userId,
      name,
      amount: parseFloat(amount),
      currency: currency || 'DZD',
      dueDate: new Date(dueDate),
      frequency,
      category,
    },
  })

  return NextResponse.json({ bill }, { status: 201 })
}
