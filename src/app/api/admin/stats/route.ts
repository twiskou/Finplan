import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getAdmin(req: NextRequest) {
  const token = req.cookies.get('finplan-token')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') return null
  return payload
}

export async function GET(req: NextRequest) {
  const payload = await getAdmin(req)
  if (!payload) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const [totalUsers, premiumUsers, totalTransactions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { plan: 'PREMIUM' } }),
    prisma.transaction.count(),
  ])
  
  // MRR (Monthly Recurring Revenue) is based on ALL active premium users
  const monthlyRevenue = premiumUsers

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, name: true, email: true, role: true, plan: true, isActive: true, createdAt: true },
  })

  return NextResponse.json({ stats: { totalUsers, premiumUsers, totalTransactions, monthlyRevenue }, recentUsers })
}
