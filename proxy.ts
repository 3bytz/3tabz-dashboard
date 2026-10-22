import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, decodeJwt } from 'jose'

const PROD = process.env.NODE_ENV === 'production'
const SESSION_COOKIE = `${PROD ? '__Host-' : ''}3tabz_admin`
const PUBLIC_PAGES = ['/login', '/setup']

async function validToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const secret = process.env.ADMIN_JWT_SECRET
  try {
    if (secret) {
      await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] })
      return true
    }
    const { exp } = decodeJwt(token)
    return typeof exp === 'number' && exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/api/session/')) return NextResponse.next()

  const ok = await validToken(request.cookies.get(SESSION_COOKIE)?.value)
  const isPublic = PUBLIC_PAGES.some(p => pathname === p || pathname.startsWith(`${p}/`))

  if (pathname.startsWith('/api/admin/')) {
    return ok ? NextResponse.next() : NextResponse.json({ message: 'Not signed in' }, { status: 401 })
  }
  if (isPublic) {
    if (ok && pathname === '/login') return NextResponse.redirect(new URL('/', request.url))
    return NextResponse.next()
  }
  if (!ok) {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.set(SESSION_COOKIE, '', { maxAge: 0, path: '/' })
    return res
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|AppIcon.png|Logo.png|.*\\.png$).*)'],
}
