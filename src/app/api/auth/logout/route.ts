import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ message: 'Déconnecté avec succès' })
  res.cookies.set('finplan-token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  })
  return res
}
