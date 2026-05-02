import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateInsights } from '@/lib/ai-insights'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('finplan-token')?.value
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Token invalide' }, { status: 401 })

  const [transactions, budgets, goals, bills, debts] = await Promise.all([
    prisma.transaction.findMany({ where: { userId: payload.userId }, orderBy: { date: 'desc' }, take: 200 }),
    prisma.budget.findMany({ where: { userId: payload.userId } }),
    prisma.savingGoal.findMany({ where: { userId: payload.userId } }),
    prisma.bill.findMany({ where: { userId: payload.userId } }),
    prisma.debt.findMany({ where: { userId: payload.userId } }),
  ])

  const insights = generateInsights({ transactions, budgets, goals, bills, debts })

  return NextResponse.json({ insights })
}
