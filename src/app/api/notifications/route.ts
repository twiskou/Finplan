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

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { language: true } })
  const userLang = user?.language || 'fr'

  // Generate notifications dynamically
  try {
    const { checkAndGenerateNotifications } = await import('@/lib/notification-engine')
    await checkAndGenerateNotifications(payload.userId, userLang)
  } catch (error) {
    console.error('Failed to generate notifications:', error)
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: payload.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ notifications })
}

export async function PATCH(req: NextRequest) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  await prisma.notification.updateMany({
    where: { userId: payload.userId, isRead: false },
    data: { isRead: true },
  })

  return NextResponse.json({ message: 'Toutes marquées comme lues' })
}
