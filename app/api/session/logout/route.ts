import { NextRequest, NextResponse } from 'next/server'
import { callApi, checkCsrf, clearAll, getSessionToken, jsonError } from '@/lib/server/session'

export async function POST(req: NextRequest) {
  const bad = checkCsrf(req)
  if (bad) return jsonError(403, bad)
  const token = getSessionToken()
  if (token) await callApi('/admin/auth/logout', { method: 'POST', token }).catch(() => null)
  const res = NextResponse.json({ loggedOut: true })
  clearAll(res)
  return res
}
