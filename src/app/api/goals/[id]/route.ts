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
  const { name, targetAmount, savedAmount, deadline, icon, color, isCompleted } = body

  const goal = await prisma.savingGoal.updateMany({
    where: { id, userId: payload.userId },
    data: {
      name,
      targetAmount: parseFloat(targetAmount),
      savedAmount: parseFloat(savedAmount),
      deadline: deadline ? new Date(deadline) : null,
      icon,
      color,
      isCompleted: isCompleted || false,
    },
  })

  return NextResponse.json({ goal })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  await prisma.savingGoal.deleteMany({ where: { id, userId: payload.userId } })
  return NextResponse.json({ message: 'Supprimé' })
}
