'use client'
import { useState, useEffect, useCallback } from 'react'
import { SectionHeader, Card, Table, Tr, Td, Badge, Button } from '@/components/ui'
import { ConfirmModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Flag, Download, Trash2, CheckCircle, AlertTriangle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { FlaggedSuggestion, DataExportRequest, DeletionRequest } from '@/lib/api'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/6 rounded ${className}`} />
}

export default function ContentPage() {
  const { success, error: toastError } = useToast()

  const [flags,     setFlags]     = useState<FlaggedSuggestion[]>([])
  const [exports,   setExports]   = useState<DataExportRequest[]>([])
  const [deletions, setDeletions] = useState<DeletionRequest[]>([])
  const [loading,   setLoading]   = useState(true)
  const [fetchError,setFetchError]= useState('')
  const [actionId,  setActionId]  = useState<string | null>(null)

  const [dismissId,     setDismissId]     = useState<string | null>(null)
  const [forceDeleteId, setForceDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setFetchError(''); setLoading(true)
    try {
      const [f, e, d] = await Promise.all([
        api.getFlaggedSuggestions(),
        api.getDataExportRequests(),
        api.getDeletionRequests(),
      ])
      setFlags(f); setExports(e); setDeletions(d)
    } catch (e: any) {
      setFetchError(e?.message ?? 'Failed to load content data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const markReviewed = async (id: string) => {
    setActionId(id)
    try {
      await api.updateFlaggedSuggestion(id, 'reviewed')
      setFlags(f => f.map(x => x.id === id ? { ...x, status: 'reviewed' } : x))
      success('Flagged suggestion marked as reviewed')
    } catch (e: any) {
      toastError(e?.message ?? 'Action failed')
    } finally {
      setActionId(null)
    }
  }

  const dismissFlag = async (id: string) => {
    setActionId(id)
    try {
      await api.updateFlaggedSuggestion(id, 'dismissed')
      setFlags(f => f.map(x => x.id === id ? { ...x, status: 'dismissed' } : x))
      success('Flag dismissed')
    } catch (e: any) {
      toastError(e?.message ?? 'Action failed')
    } finally {
      setActionId(null); setDismissId(null)
    }
  }

  const markDispatched = async (id: string) => {
    setActionId(id)
    try {
      const updated = await api.markExportDispatched(id)
      setExports(e => e.map(x => x.id === id ? updated : x))
      success('Data export marked as dispatched')
    } catch (e: any) {
      toastError(e?.message ?? 'Action failed')
    } finally {
      setActionId(null)
    }
  }

  const executeDeletion = async (id: string) => {
    setActionId(id)
    try {
      await api.executeDeletion(id)
      setDeletions(d => d.map(x => x.id === id ? { ...x, status: 'completed' } : x))
      success('Account deletion executed')
    } catch (e: any) {
      toastError(e?.message ?? 'Deletion failed')
    } finally {
      setActionId(null); setForceDeleteId(null)
    }
  }

  const pendingFlags   = flags.filter(f => f.status === 'pending').length
  const pendingExports = exports.filter(e => e.status === 'pending').length
  const overdueDels    = deletions.filter(d => d.status === 'overdue').length

  return (
    <div className="max-w-[1400px] space-y-6">

      {fetchError && (
        <div className="flex items-center gap-3 border border-red-900 bg-red-950/30 text-red-400 text-sm px-4 py-3">
          <AlertCircle size={14} /> {fetchError}
          <button onClick={load} className="ml-auto flex items-center gap-1 underline hover:no-underline">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-px bg-white/6 border border-white/6">
        <div className="bg-[#111] p-4 flex items-center gap-3">
          <Flag size={16} className={pendingFlags > 0 ? 'text-yellow-400' : 'text-[#525252]'} />
          <div>
            <div className="text-xs text-[#737373] uppercase tracking-widest">Flagged Suggestions</div>
            <div className={`text-2xl font-display font-bold ${pendingFlags > 0 ? 'text-yellow-400' : 'text-white'}`}>
              {loading ? '…' : `${pendingFlags} pending`}
            </div>
          </div>
        </div>
        <div className="bg-[#111] p-4 flex items-center gap-3">
          <Download size={16} className={pendingExports > 0 ? 'text-accent' : 'text-[#525252]'} />
          <div>
            <div className="text-xs text-[#737373] uppercase tracking-widest">Data Export Requests</div>
            <div className={`text-2xl font-display font-bold ${pendingExports > 0 ? 'text-accent' : 'text-white'}`}>
              {loading ? '…' : `${pendingExports} pending`}
            </div>
          </div>
        </div>
        <div className="bg-[#111] p-4 flex items-center gap-3">
          <Trash2 size={16} className={overdueDels > 0 ? 'text-red-400' : 'text-[#525252]'} />
          <div>
            <div className="text-xs text-[#737373] uppercase tracking-widest">Deletion Requests</div>
            <div className={`text-2xl font-display font-bold ${overdueDels > 0 ? 'text-red-400' : 'text-white'}`}>
              {loading ? '…' : overdueDels > 0 ? `${overdueDels} overdue` : `${deletions.filter(d => d.status === 'pending').length} queued`}
            </div>
          </div>
        </div>
      </div>

      {/* Flagged AI Suggestions */}
      <Card>
        <SectionHeader
          title="Flagged AI Suggestions"
          sub="Users flagged these suggestions as harmful or incorrect. Review and take action."
          action={<div className="flex items-center gap-2 text-xs text-[#525252]"><Flag size={12} /> {pendingFlags} need review</div>}
        />
        {loading
          ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          : flags.length === 0
            ? <div className="py-6 text-center text-sm text-[#525252]">No flagged suggestions.</div>
            : (
              <Table headers={['User', 'Suggestion', 'Reason', 'Flagged', 'Status', '']}>
                {flags.map(f => (
                  <Tr key={f.id}>
                    <Td>
                      <div className="text-white text-sm whitespace-nowrap">{f.userName}</div>
                      <div className="text-xs text-[#525252]">{f.userId}</div>
                    </Td>
                    <Td><p className="text-xs text-[#a3a3a3] max-w-xs leading-relaxed">{f.suggestionText}</p></Td>
                    <Td><p className="text-xs text-yellow-400 max-w-[160px] leading-relaxed">{f.reason}</p></Td>
                    <Td><span className="text-xs text-[#525252] whitespace-nowrap">{new Date(f.flaggedAt).toLocaleDateString()}</span></Td>
                    <Td>
                      <Badge color={f.status === 'pending' ? 'yellow' : f.status === 'reviewed' ? 'green' : 'gray'}>
                        {f.status}
                      </Badge>
                    </Td>
                    <Td>
                      {f.status === 'pending' && (
                        <div className="flex gap-1.5">
                          {actionId === f.id
                            ? <Loader2 size={14} className="animate-spin text-[#525252]" />
                            : (
                              <>
                                <Button variant="secondary" size="sm" onClick={() => markReviewed(f.id)}>
                                  <CheckCircle size={11} /> Mark reviewed
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setDismissId(f.id)}>
                                  Dismiss
                                </Button>
                              </>
                            )
                          }
                        </div>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Table>
            )
        }
      </Card>

      {/* Data Export Requests */}
      <Card>
        <SectionHeader
          title="Data Export Requests"
          sub="Users requested their full data export from the Privacy & Data screen in the app."
          action={<span className="text-xs text-[#525252]">Dispatch within 24h of request</span>}
        />
        {loading
          ? <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          : exports.length === 0
            ? <div className="py-6 text-center text-sm text-[#525252]">No export requests.</div>
            : (
              <Table headers={['User', 'Email', 'Requested', 'Status', 'Notes', '']}>
                {exports.map(e => (
                  <Tr key={e.id}>
                    <Td><span className="text-white text-sm">{e.userName}</span></Td>
                    <Td><span className="text-xs text-[#525252]">{e.email}</span></Td>
                    <Td><span className="text-xs text-[#525252] whitespace-nowrap">{new Date(e.requestedAt).toLocaleString()}</span></Td>
                    <Td><Badge color={e.status === 'pending' ? 'accent' : 'green'}>{e.status}</Badge></Td>
                    <Td><span className="text-xs text-[#525252]">{e.notes || '—'}</span></Td>
                    <Td>
                      {e.status === 'pending' && (
                        actionId === e.id
                          ? <Loader2 size={14} className="animate-spin text-[#525252]" />
                          : (
                            <Button variant="primary" size="sm" onClick={() => markDispatched(e.id)}>
                              <Download size={11} /> Mark dispatched
                            </Button>
                          )
                      )}
                    </Td>
                  </Tr>
                ))}
              </Table>
            )
        }
      </Card>

      {/* Account Deletion Queue */}
      <Card>
        <SectionHeader
          title="Account Deletion Queue"
          sub="Scheduled deletions. Data is permanently purged on the deletion due date. Overdue items need immediate action."
          action={
            overdueDels > 0
              ? <div className="flex items-center gap-1.5 text-xs text-red-400"><AlertTriangle size={12} /> {overdueDels} overdue</div>
              : undefined
          }
        />
        {loading
          ? <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          : deletions.length === 0
            ? <div className="py-6 text-center text-sm text-[#525252]">No pending deletions.</div>
            : (
              <Table headers={['User', 'Email', 'Requested', 'Deletion Due', 'Days Left', 'Status', '']}>
                {deletions.map(d => (
                  <Tr key={d.id}>
                    <Td><span className="text-white text-sm">{d.userName}</span></Td>
                    <Td><span className="text-xs text-[#525252]">{d.email}</span></Td>
                    <Td><span className="text-xs text-[#525252] whitespace-nowrap">{new Date(d.requestedAt).toLocaleDateString()}</span></Td>
                    <Td>
                      <span className={`text-xs whitespace-nowrap ${d.status === 'overdue' ? 'text-red-400 font-medium' : 'text-[#525252]'}`}>
                        {new Date(d.deletionDue).toLocaleDateString()}
                      </span>
                    </Td>
                    <Td>
                      <span className={`text-sm font-medium ${
                        d.daysLeft < 0 ? 'text-red-400' : d.daysLeft < 7 ? 'text-yellow-400' : 'text-[#a3a3a3]'
                      }`}>
                        {d.daysLeft < 0 ? `${Math.abs(d.daysLeft)}d overdue` : `${d.daysLeft}d`}
                      </span>
                    </Td>
                    <Td>
                      <Badge color={d.status === 'overdue' ? 'red' : d.status === 'completed' ? 'green' : 'yellow'}>
                        {d.status}
                      </Badge>
                    </Td>
                    <Td>
                      {d.status !== 'completed' && (
                        actionId === d.id
                          ? <Loader2 size={14} className="animate-spin text-[#525252]" />
                          : (
                            <Button variant="danger" size="sm" onClick={() => setForceDeleteId(d.id)}>
                              <Trash2 size={11} /> Execute now
                            </Button>
                          )
                      )}
                    </Td>
                  </Tr>
                ))}
              </Table>
            )
        }
      </Card>

      {/* Modals */}
      <ConfirmModal
        open={!!dismissId}
        onClose={() => setDismissId(null)}
        onConfirm={() => { if (dismissId) dismissFlag(dismissId) }}
        title="Dismiss flag"
        message="This marks the flag as dismissed. The AI suggestion will remain visible to the user. Only dismiss if the suggestion is medically sound."
        confirmLabel="Dismiss flag"
      />
      <ConfirmModal
        open={!!forceDeleteId}
        onClose={() => setForceDeleteId(null)}
        onConfirm={() => { if (forceDeleteId) executeDeletion(forceDeleteId) }}
        title="Execute account deletion"
        message="This permanently deletes all data for this account. The user will be signed out immediately. This cannot be undone."
        confirmLabel="Delete permanently"
        danger
      />
    </div>
  )
}