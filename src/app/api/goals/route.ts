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

  const goals = await prisma.savingGoal.findMany({
    where: { userId: payload.userId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ goals })
}

export async function POST(req: NextRequest) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = await req.json()
  const { name, targetAmount, savedAmount, deadline, icon, color } = body

  if (!name || !targetAmount) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

  const goal = await prisma.savingGoal.create({
    data: {
      userId: payload.userId,
      name,
      targetAmount: parseFloat(targetAmount),
      savedAmount: parseFloat(savedAmount || '0'),
      deadline: deadline ? new Date(deadline) : null,
      icon: icon || '🎯',
      color: color || '#6366F1',
    },
  })

  return NextResponse.json({ goal }, { status: 201 })
}
