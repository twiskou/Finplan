import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/', '/login', '/register', '/pricing']
const AUTH_PATHS = ['/login', '/register']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('finplan-token')?.value

  // Allow public API routes and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const isPublic = PUBLIC_PATHS.includes(pathname)
  const isAuth = AUTH_PATHS.includes(pathname)
  const isAdmin = pathname.startsWith('/admin')
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/transactions') ||
    pathname.startsWith('/budgets') || pathname.startsWith('/goals') || pathname.startsWith('/bills') ||
    pathname.startsWith('/debts') || pathname.startsWith('/insights') || pathname.startsWith('/settings') ||
    pathname.startsWith('/notifications')

  let payload = null
  if (token) {
    payload = await verifyToken(token)
  }

  // Redirect logged-in users away from auth pages
  if (isAuth && payload) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protect dashboard routes
  if (isDashboard && !payload) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Protect admin routes
  if (isAdmin) {
    if (!payload) return NextResponse.redirect(new URL('/login', req.url))
    if (payload.role !== 'ADMIN') return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protect API routes
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    if (!payload) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    if (pathname.startsWith('/api/admin/') && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
