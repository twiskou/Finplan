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

  const budget = await prisma.budget.updateMany({
    where: { id, userId: payload.userId },
    data: { limit: parseFloat(body.limit), category: body.category },
  })

  return NextResponse.json({ budget })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  await prisma.budget.deleteMany({ where: { id, userId: payload.userId } })
  return NextResponse.json({ message: 'Supprimé' })
}
