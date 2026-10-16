import { NextRequest, NextResponse } from 'next/server'
import { callApi, checkCsrf, jsonError } from '@/lib/server/session'

/** Invite acceptance (public): sets the new admin's password. TOTP is enrolled at first login. */
export async function POST(req: NextRequest) {
  const bad = checkCsrf(req)
  if (bad) return jsonError(403, bad)
  const { inviteToken, password } = await req.json().catch(() => ({}))
  if (!inviteToken || !password) return jsonError(400, 'Missing details')
  const r = await callApi('/admin/auth/setup-account', { method: 'POST', body: JSON.stringify({ inviteToken: String(inviteToken), password: String(password) }) })
  if (!r.ok) return jsonError(r.status, r.json?.message ?? 'Setup failed')
  return NextResponse.json({ ok: true })
}
