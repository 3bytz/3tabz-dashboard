import { NextResponse } from 'next/server'
import { callApi, clearAll, getSessionToken, jsonError } from '@/lib/server/session'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = await getSessionToken()
  if (!token) return jsonError(401, 'Not signed in')
  const r = await callApi('/admin/auth/me', { token })
  if (r.status === 401) {
    const res = jsonError(401, 'Session expired')
    clearAll(res)
    return res
  }
  return NextResponse.json(r.data ?? null, { status: r.status })
}
