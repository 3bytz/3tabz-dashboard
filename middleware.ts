import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname    = request.nextUrl.pathname
  const isLoginPage = pathname === '/login'
  const isSetupPage = pathname.startsWith('/setup')
  const token       = request.cookies.get('admin_token')?.value

  if (isLoginPage || isSetupPage) {
    if (token && isLoginPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // All other pages require the admin_token cookie
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
