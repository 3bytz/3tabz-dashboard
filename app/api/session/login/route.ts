import { NextRequest, NextResponse } from 'next/server'
import { callApi, checkCsrf, clearAll, jsonError, setPending, setSession } from '@/lib/server/session'

export async function POST(req: NextRequest) {
  const bad = checkCsrf(req)
  if (bad) return jsonError(403, bad)
  const body = await req.json().catch(() => ({}))
  const email = String(body?.email ?? '').slice(0, 254)
  const password = String(body?.password ?? '').slice(0, 200)
  if (!email || !password) return jsonError(400, 'Email and password are required')

  const r = await callApi('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: { 'X-Forwarded-For': req.headers.get('x-forwarded-for') ?? '', 'User-Agent': req.headers.get('user-agent') ?? '' },
  })
  if (!r.ok) {
    const res = jsonError(r.status, r.json?.message ?? 'Sign in failed')
    clearAll(res)
    return res
  }
  const d = r.data ?? {}
  const res = NextResponse.json({
    totpRequired: !!d.totpRequired,
    totpSetupRequired: !!d.totpSetupRequired,
    signedIn: !!d.accessToken,
  })
  if (d.accessToken) setSession(res, d.accessToken, d.expiresIn)
  else if (d.totpRequired && d.partialToken) setPending(res, 'totp', d.partialToken)
  else if (d.totpSetupRequired && d.setupToken) setPending(res, 'setup', d.setupToken)
  return res
}
