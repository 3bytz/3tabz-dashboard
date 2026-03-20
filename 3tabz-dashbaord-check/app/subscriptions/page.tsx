'use client'
import { useState, useEffect, useCallback } from 'react'
import { SectionHeader, Table, Tr, Td, Badge, Button, Select, StatCard } from '@/components/ui'
import { ConfirmModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Download, ShieldCheck, XCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import type { Subscription } from '@/lib/api'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/6 rounded ${className}`} />
}

export default function SubscriptionsPage() {
  const { success, error: toastError } = useToast()

  const [rows,           setRows]           = useState<Subscription[]>([])
  const [loading,        setLoading]        = useState(true)
  const [fetchError,     setFetchError]     = useState('')
  const [actionId,       setActionId]       = useState<string | null>(null)
  const [statusFilter,   setStatusFilter]   = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [revokeTarget,   setRevokeTarget]   = useState<Subscription | null>(null)
  const [grantTarget,    setGrantTarget]    = useState<Subscription | null>(null)
  const [detail,         setDetail]         = useState<Subscription | null>(null)

  const load = useCallback(async () => {
    setFetchError(''); setLoading(true)
    try {
      const data = await api.getSubscriptions()
      setRows(data)
    } catch (e: any) {
      setFetchError(e?.message ?? 'Failed to load subscriptions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = rows.filter(s => {
    const okStatus   = statusFilter   === 'all' || s.status   === statusFilter
    const okPlatform = platformFilter === 'all' || s.platform === platformFilter
    return okStatus && okPlatform
  })

  const activeRows   = rows.filter(s => s.status === 'active')
  const mrr          = activeRows.reduce((a, s) => a + (s.revenue / 3 || 2.99), 0) // estimate monthly
  const totalRev     = rows.reduce((a, s) => a + s.revenue, 0)
  const appleActive  = activeRows.filter(s => s.platform === 'apple').length
  const googleActive = activeRows.filter(s => s.platform === 'google').length

  const statusColor = (s: string) =>
    s === 'active' ? 'green' : s === 'cancelled' ? 'red' : s === 'expired' ? 'gray' : 'yellow'

  const doRevoke = async () => {
    if (!revokeTarget) return
    setActionId(revokeTarget.id)
    try {
      await api.revokeSubscription(revokeTarget.id)
      setRows(r => r.map(s =>
        s.id === revokeTarget.id ? { ...s, status: 'cancelled', autoRenew: false } : s
      ))
      if (detail?.id === revokeTarget.id)
        setDetail(d => d ? { ...d, status: 'cancelled', autoRenew: false } : null)
      success(`${revokeTarget.userName}'s subscription revoked`)
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to revoke subscription')
    } finally {
      setActionId(null); setRevokeTarget(null)
    }
  }

  const doGrant = async () => {
    if (!grantTarget) return
    setActionId(grantTarget.userId)
    try {
      const updated = await api.grantSubscription(grantTarget.userId, 30)
      setRows(r => r.map(s => s.id === grantTarget.id ? updated : s))
      success(`Pro granted to ${grantTarget.userName} for 30 days`)
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to grant Pro')
    } finally {
      setActionId(null); setGrantTarget(null)
    }
  }

  const exportCSV = () => {
    const header = 'User,Email,Platform,Status,AutoRenew,Started,Expires,Revenue'
    const body   = rows.map(s =>
      `"${s.userName}",${s.email},${s.platform},${s.status},${s.autoRenew},${s.started},${s.expires},${s.revenue}`)
    const blob = new Blob([[header, ...body].join('\n')], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: '3tabz-subscriptions.csv' })
    a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-[1400px] space-y-5">

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/6 border border-white/6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111] p-5"><Skeleton className="h-8 w-24 mb-2" /><Skeleton className="h-3 w-32" /></div>
          ))
        ) : (
          <>
            <StatCard label="MRR"           value={`$${mrr.toFixed(2)}`}      sub={`$${(mrr*12).toFixed(0)} ARR`} accent />
            <StatCard label="Total Revenue" value={`$${totalRev.toFixed(2)}`} sub="All time" />
            <StatCard label="Apple active"  value={appleActive}                sub="iOS subscribers" />
            <StatCard label="Google active" value={googleActive}               sub="Android subscribers" />
          </>
        )}
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 border border-red-900 bg-red-950/30 text-red-400 text-sm px-4 py-3">
          <AlertCircle size={14} />
          {fetchError}
          <button onClick={load} className="ml-auto flex items-center gap-1 underline hover:no-underline">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      <SectionHeader
        title="Subscriptions"
        sub={loading ? 'Loading…' : `${rows.length} records · ${activeRows.length} active`}
        action={
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onChange={setStatusFilter} options={[
              { value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' },
              { value: 'cancelled', label: 'Cancelled' }, { value: 'expired', label: 'Expired' },
            ]} />
            <Select value={platformFilter} onChange={setPlatformFilter} options={[
              { value: 'all', label: 'All platforms' },
              { value: 'apple', label: '🍎 Apple' }, { value: 'google', label: '🤖 Google' },
            ]} />
            <Button variant="secondary" size="sm" onClick={exportCSV} disabled={loading}>
              <Download size={12} /> Export CSV
            </Button>
          </div>
        }
      />

      <div className="border border-white/8 bg-[#111]">
        <Table headers={['User', 'Platform', 'Status', 'Auto-renew', 'Started', 'Expires', 'Revenue', '']}>
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <Tr key={i}>{Array.from({ length: 8 }).map((_, j) => <Td key={j}><Skeleton className="h-4 w-full" /></Td>)}</Tr>
          ))}
          {!loading && filtered.length === 0 && (
            <Tr><Td className="text-[#525252] py-8 text-center">No subscriptions match the current filters.</Td></Tr>
          )}
          {!loading && filtered.map(s => (
            <Tr key={s.id} className={detail?.id === s.id ? 'bg-accent/5' : ''}>
              <Td>
                <div className="text-white text-sm font-medium">{s.userName}</div>
                <div className="text-xs text-[#525252]">{s.email}</div>
              </Td>
              <Td><Badge color="gray">{s.platform === 'apple' ? '🍎 Apple' : '🤖 Google'}</Badge></Td>
              <Td><Badge color={statusColor(s.status) as any}>{s.status}</Badge></Td>
              <Td>
                <span className={s.autoRenew ? 'text-green-400 text-xs' : 'text-[#525252] text-xs'}>
                  {s.autoRenew ? 'Yes' : 'No'}
                </span>
              </Td>
              <Td><span className="text-xs text-[#525252]">{s.started}</span></Td>
              <Td><span className="text-xs text-[#525252]">{s.expires}</span></Td>
              <Td><span className="text-accent font-medium">${s.revenue.toFixed(2)}</span></Td>
              <Td>
                <div className="flex gap-1.5 items-center">
                  {actionId === s.id
                    ? <Loader2 size={14} className="animate-spin text-[#525252]" />
                    : (
                      <>
                        {s.status !== 'active' && (
                          <Button variant="secondary" size="sm" onClick={() => setGrantTarget(s)}>
                            <ShieldCheck size={11} /> Grant Pro
                          </Button>
                        )}
                        {s.status === 'active' && (
                          <Button variant="danger" size="sm" onClick={() => setRevokeTarget(s)}>
                            <XCircle size={11} /> Revoke
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setDetail(detail?.id === s.id ? null : s)}>
                          {detail?.id === s.id ? 'Close' : 'Detail'}
                        </Button>
                      </>
                    )
                  }
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </div>

      {/* Inline detail panel */}
      {detail && (
        <div className="border border-white/8 bg-[#111] p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-display font-bold text-white">{detail.userName}</h3>
              <p className="text-xs text-[#525252]">{detail.email}</p>
            </div>
            <button onClick={() => setDetail(null)} className="text-xs text-[#525252] hover:text-white">Close ✕</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Product ID', value: detail.productId },
              { label: 'Record ID',  value: detail.id },
              { label: 'Platform',   value: detail.platform === 'apple' ? '🍎 Apple' : '🤖 Google' },
              { label: 'Auto-renew', value: detail.autoRenew ? 'Enabled' : 'Disabled' },
            ].map(r => (
              <div key={r.label} className="bg-[#0a0a0a] border border-white/6 p-3">
                <div className="text-xs text-[#525252] mb-1">{r.label}</div>
                <div className="text-white font-mono text-xs break-all">{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={doRevoke}
        title="Revoke subscription"
        message={`This cancels ${revokeTarget?.userName}'s Pro subscription immediately and downgrades them to Free. Their data is preserved.`}
        confirmLabel="Revoke"
        danger
      />
      <ConfirmModal
        open={!!grantTarget}
        onClose={() => setGrantTarget(null)}
        onConfirm={doGrant}
        title="Grant Pro access"
        message={`This manually grants ${grantTarget?.userName} a 30-day Pro subscription at no charge. Use for support resolutions or comps only.`}
        confirmLabel="Grant Pro"
      />
    </div>
  )
}