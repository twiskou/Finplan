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

  await prisma.bill.updateMany({
    where: { id, userId: payload.userId },
    data: {
      name: body.name,
      amount: parseFloat(body.amount),
      dueDate: new Date(body.dueDate),
      frequency: body.frequency,
      category: body.category,
      isPaid: body.isPaid,
    },
  })

  return NextResponse.json({ message: 'Mis à jour' })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = await params
  await prisma.bill.deleteMany({ where: { id, userId: payload.userId } })
  return NextResponse.json({ message: 'Supprimé' })
}
