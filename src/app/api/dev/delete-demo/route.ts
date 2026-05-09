import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany()
  const demoUsers = users.filter(u => u.email.includes('demo') || u.name.toLowerCase().includes('demo'))
  
  let count = 0
  for (const u of demoUsers) {
    await prisma.user.delete({ where: { id: u.id } })
    count++
  }
  
  return NextResponse.json({ message: `Deleted ${count} demo users`, deleted: demoUsers.map(u => u.email) })
}
