/**
 * Server-only session helpers for the admin BFF (backend-for-frontend).
 *
 * WHY: the admin JWT used to live in a JavaScript-readable cookie (`admin_token`,
 * SameSite=Lax, no HttpOnly) and was sent from the browser straight to the API. Any
 * XSS in the dashboard could steal an admin session. Now:
 *  - the JWT sits in an HttpOnly, Secure, SameSite=Strict cookie the browser JS can't read;
 *  - the browser only talks to this Next.js app (/api/session/*, /api/admin/*), which
 *    attaches the token server-side;
 *  - state-changing requests need a CSRF double-submit token and a same-origin Origin header.
 */
import 'server-only'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'

const PROD = process.env.NODE_ENV === 'production'
const PREFIX = PROD ? '__Host-' : ''
export const SESSION_COOKIE = `${PREFIX}3tabz_admin`
export const PENDING_COOKIE = `${PREFIX}3tabz_pending`
export const CSRF_COOKIE = `${PREFIX}3tabz_csrf`

/** Server-side API base (not exposed to the browser). */
export const API_URL = (process.env.ADMIN_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'https://api.3tabz.com/v1').replace(/\/$/, '')

const base = { httpOnly: true, secure: PROD, sameSite: 'strict' as const, path: '/' }

export function setSession(res: NextResponse, accessToken: string, maxAgeSeconds = 8 * 3600) {
  res.cookies.set(SESSION_COOKIE, accessToken, { ...base, maxAge: maxAgeSeconds })
  res.cookies.set(PENDING_COOKIE, '', { ...base, maxAge: 0 })
  setCsrf(res)
}

export function setPending(res: NextResponse, kind: 'totp' | 'setup', token: string) {
  res.cookies.set(PENDING_COOKIE, `${kind}.${token}`, { ...base, maxAge: 10 * 60 })
}

export function clearAll(res: NextResponse) {
  for (const n of [SESSION_COOKIE, PENDING_COOKIE]) res.cookies.set(n, '', { ...base, maxAge: 0 })
  res.cookies.set(CSRF_COOKIE, '', { ...base, httpOnly: false, maxAge: 0 })
}

export function setCsrf(res: NextResponse) {
  // Readable by JS on purpose (double-submit). Useless to an attacker without same-origin JS.
  res.cookies.set(CSRF_COOKIE, crypto.randomBytes(24).toString('base64url'), { ...base, httpOnly: false, maxAge: 8 * 3600 })
}

export function getSessionToken(): string | null {
  return cookies().get(SESSION_COOKIE)?.value || null
}

export function getPending(): { kind: 'totp' | 'setup'; token: string } | null {
  const raw = cookies().get(PENDING_COOKIE)?.value
  if (!raw) return null
  const i = raw.indexOf('.')
  const kind = raw.slice(0, i)
  if (kind !== 'totp' && kind !== 'setup') return null
  return { kind, token: raw.slice(i + 1) }
}

/** Same-origin + CSRF double-submit check for state-changing requests. */
export function checkCsrf(req: NextRequest): string | null {
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (!origin || !host) return 'Missing origin'
  try {
    if (new URL(origin).host !== host) return 'Cross-site request blocked'
  } catch {
    return 'Bad origin'
  }
  if (req.method === 'POST' && req.nextUrl.pathname.startsWith('/api/session/')) return null // login has no session yet
  const header = req.headers.get('x-csrf-token') ?? ''
  const cookie = req.cookies.get(CSRF_COOKIE)?.value ?? ''
  if (!header || !cookie || header.length !== cookie.length) return 'CSRF token missing'
  if (!crypto.timingSafeEqual(Buffer.from(header), Buffer.from(cookie))) return 'CSRF token mismatch'
  return null
}

export async function callApi(path: string, init: RequestInit & { token?: string | null } = {}) {
  const { token, ...rest } = init
  const headers = new Headers(rest.headers)
  headers.set('Accept', 'application/json')
  if (rest.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${API_URL}${path}`, { ...rest, headers, cache: 'no-store', redirect: 'manual' })
  const text = await res.text()
  let json: any = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { message: text.slice(0, 200) }
  }
  return { status: res.status, ok: res.ok, json, data: json?.data ?? json }
}

export function jsonError(status: number, message: string) {
  return NextResponse.json({ message }, { status })
}
