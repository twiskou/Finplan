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

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, plan: true, isActive: true, createdAt: true, language: true },
  })

  return NextResponse.json({ users })
}

export async function PATCH(req: NextRequest) {
  const payload = await getAdmin(req)
  if (!payload) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const body = await req.json()
  const { userId, plan, isActive, role } = body

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { plan, isActive, role },
    select: { id: true, name: true, email: true, role: true, plan: true, isActive: true },
  })

  return NextResponse.json({ user: updated })
}
