import { NextRequest, NextResponse } from 'next/server'
import { callApi, checkCsrf, clearAll, getSessionToken, jsonError } from '@/lib/server/session'

export const dynamic = 'force-dynamic'
const SEGMENT = /^[A-Za-z0-9_-]{1,64}$/

async function handle(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const segs = (await params).path ?? []
  if (!segs.length || !segs.every(s => SEGMENT.test(s)) || segs[0] === 'auth') return jsonError(404, 'Not found')
  if (req.method !== 'GET') {
    const bad = checkCsrf(req)
    if (bad) return jsonError(403, bad)
  }
  const token = await getSessionToken()
  if (!token) return jsonError(401, 'Not signed in')

  const qs = req.nextUrl.search
  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text()
  if (body && body.length > 1_000_000) return jsonError(413, 'Request too large')
  const r = await callApi(`/admin/${segs.join('/')}${qs}`, {
    method: req.method,
    token,
    body,
    headers: {
      'X-Forwarded-For': req.headers.get('x-forwarded-for') ?? '',
      'User-Agent': req.headers.get('user-agent') ?? '',
    },
  })
  const res = NextResponse.json(r.json ?? null, { status: r.status })
  if (r.status === 401) clearAll(res)
  res.headers.set('Cache-Control', 'no-store')
  return res
}

export { handle as GET, handle as POST, handle as PATCH, handle as PUT, handle as DELETE }
