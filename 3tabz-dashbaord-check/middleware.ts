import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isMockMode  = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
  const isLoginPage = request.nextUrl.pathname === '/login'

  // ── Mock / development mode: no auth enforcement ──────────────
  // Set NEXT_PUBLIC_USE_MOCK=false in .env.local to enable auth.
  if (isMockMode) {
    // Still redirect away from /login in mock mode so you land on the dashboard
    if (isLoginPage) return NextResponse.redirect(new URL('/', request.url))
    return NextResponse.next()
  }

  // ── Production mode: enforce admin_token cookie ───────────────
  const token = request.cookies.get('admin_token')?.value

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}