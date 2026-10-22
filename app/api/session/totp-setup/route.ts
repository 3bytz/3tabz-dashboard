import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { callApi, checkCsrf, getPending, jsonError } from '@/lib/server/session'

export async function POST(req: NextRequest) {
  const bad = checkCsrf(req)
  if (bad) return jsonError(403, bad)
  const pending = await getPending()
  if (!pending || pending.kind !== 'setup') return jsonError(401, 'Your sign-in expired. Start again.')
  const r = await callApi('/admin/auth/setup-totp', { method: 'POST', token: pending.token })
  if (!r.ok) return jsonError(r.status, r.json?.message ?? 'Could not start setup')
  const qr = await QRCode.toDataURL(String(r.data.uri), { margin: 1, width: 220 })
  return NextResponse.json({ secret: r.data.secret, qr })
}
