import { NextRequest, NextResponse } from 'next/server'
import { callApi, checkCsrf, getPending, jsonError, setSession } from '@/lib/server/session'

export async function POST(req: NextRequest) {
  const bad = checkCsrf(req)
  if (bad) return jsonError(403, bad)
  const pending = await getPending()
  if (!pending || pending.kind !== 'totp') return jsonError(401, 'Your sign-in expired. Start again.')
  const { code } = await req.json().catch(() => ({ code: '' }))
  if (!/^\d{6}$/.test(String(code))) return jsonError(400, 'Enter the 6-digit code')
  const r = await callApi('/admin/auth/verify-totp', { method: 'POST', token: pending.token, body: JSON.stringify({ token: String(code) }) })
  if (!r.ok || !r.data?.accessToken) return jsonError(r.status || 401, r.json?.message ?? 'Invalid code')
  const res = NextResponse.json({ signedIn: true, admin: r.data.admin ?? null })
  setSession(res, r.data.accessToken, r.data.expiresIn)
  return res
}
