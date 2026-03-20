'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Badge, Button, Card, SectionHeader, Table, Tr, Td } from '@/components/ui'
import { ConfirmModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { ArrowLeft, ShieldCheck, UserX, RefreshCw, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { User, Subscription, UserActivity } from '@/lib/api'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/6 rounded ${className}`} />
}

export default function UserDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const { success, error: toastError, warning, info } = useToast()

  const [user,     setUser]     = useState<User | null>(null)
  const [subs,     setSubs]     = useState<Subscription[]>([])
  const [activity, setActivity] = useState<UserActivity[]>([])
  const [loading,  setLoading]  = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)

  const [banModal,    setBanModal]    = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [u, s, a] = await Promise.all([
          api.getUserById(id),
          api.getUserSubscriptions(id),
          api.getUserActivity(id),
        ])
        setUser(u)
        setSubs(s)
        setActivity(a)
      } catch (e: any) {
        setFetchError(e?.message ?? 'Failed to load user')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleBan = async () => {
    if (!user) return
    setActionId('ban')
    try {
      if (user.status === 'banned') {
        await api.unbanUser(user.id)
        setUser(u => u ? { ...u, status: 'active' } : u)
        info(`${user.name} has been unbanned`)
      } else {
        await api.banUser(user.id)
        setUser(u => u ? { ...u, status: 'banned' } : u)
        warning(`${user.name} has been banned`)
      }
    } catch (e: any) {
      toastError(e?.message ?? 'Action failed')
    } finally {
      setActionId(null)
      setBanModal(false)
    }
  }

  const handleGrantPro = async () => {
    if (!user) return
    setActionId('grant')
    try {
      await api.grantPro(user.id)
      setUser(u => u ? { ...u, plan: 'pro' } : u)
      success(`Pro access granted to ${user.name}`)
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to grant Pro')
    } finally {
      setActionId(null)
    }
  }

  const handleResetPassword = async () => {
    if (!user) return
    setActionId('reset')
    try {
      await api.resetPassword(user.id)
      success(`Password reset email sent to ${user.email}`)
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to send reset email')
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async () => {
    if (!user) return
    setActionId('delete')
    try {
      await api.deleteUser(user.id)
      success(`${user.name}'s account scheduled for deletion`)
      router.push('/users')
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to delete account')
      setActionId(null)
      setDeleteModal(false)
    }
  }

  const statusColor = (s: string) =>
    s === 'active' ? 'green' : s === 'cancelled' ? 'red' : s === 'expired' ? 'gray' : 'yellow'

  if (loading) {
    return (
      <div className="max-w-[960px] space-y-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-4 gap-px"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (fetchError || !user) {
    return (
      <div className="max-w-[960px]">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-[#525252] hover:text-white transition-colors mb-4">
          <ArrowLeft size={12} /> Back to users
        </button>
        <div className="flex items-center gap-3 border border-red-900 bg-red-950/30 text-red-400 text-sm px-4 py-3">
          <AlertCircle size={14} />
          {fetchError || 'User not found.'}
        </div>
      </div>
    )
  }

  const isBanned = user.status === 'banned'

  return (
    <div className="max-w-[960px] space-y-5">

      <button onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-[#525252] hover:text-white transition-colors">
        <ArrowLeft size={12} /> Back to users
      </button>

      {/* Header card */}
      <div className="border border-white/8 bg-[#111] p-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-xl text-white mb-1">{user.name}</h2>
          <p className="text-xs text-[#525252]">
            {user.email} · ID: <code className="text-accent">{user.id}</code>
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Badge color={user.plan === 'pro' ? 'accent' : 'gray'}>{user.plan.toUpperCase()}</Badge>
            <Badge color={isBanned ? 'red' : user.status === 'active' ? 'green' : 'gray'}>
              {user.status}
            </Badge>
            <Badge color="gray">{user.platform.toUpperCase()}</Badge>
            <Badge color="gray">{user.country}</Badge>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" disabled={actionId === 'reset'} onClick={handleResetPassword}>
            {actionId === 'reset' ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Reset password
          </Button>
          {user.plan === 'free' && (
            <Button variant="primary" size="sm" disabled={actionId === 'grant'} onClick={handleGrantPro}>
              {actionId === 'grant' ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
              Grant Pro
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => setBanModal(true)}>
            <UserX size={12} /> {isBanned ? 'Unban' : 'Ban'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)}>
            <Trash2 size={12} /> Delete account
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/6 border border-white/6">
        {[
          { label: 'Collections',  value: user.collections },
          { label: 'Medications',  value: user.medications },
          { label: 'Member since', value: user.joined },
          { label: 'Last active',  value: user.lastActive },
        ].map(s => (
          <div key={s.label} className="bg-[#111] p-4">
            <div className="text-xs text-[#737373] uppercase tracking-widest mb-1">{s.label}</div>
            <div className="text-white font-medium text-sm">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Subscription History */}
      <Card>
        <SectionHeader
          title="Subscription History"
          sub={subs.length > 0 ? `${subs.length} record${subs.length > 1 ? 's' : ''}` : 'No subscription records'}
        />
        {subs.length === 0 ? (
          <div className="py-6 text-center text-sm text-[#525252]">
            This user has never held a Pro subscription.
          </div>
        ) : (
          <>
            <Table headers={['Platform', 'Status', 'Product', 'Started', 'Expires', 'Revenue', 'Auto-renew']}>
              {subs.map(s => (
                <Tr key={s.id}>
                  <Td><Badge color="gray">{s.platform === 'apple' ? '🍎 Apple' : '🤖 Google'}</Badge></Td>
                  <Td><Badge color={statusColor(s.status) as any}>{s.status}</Badge></Td>
                  <Td><code className="text-xs text-[#525252] font-mono">{s.productId}</code></Td>
                  <Td><span className="text-xs text-[#525252]">{s.started}</span></Td>
                  <Td><span className="text-xs text-[#525252]">{s.expires}</span></Td>
                  <Td><span className="text-accent font-medium">${s.revenue.toFixed(2)}</span></Td>
                  <Td>
                    <span className={s.autoRenew ? 'text-green-400 text-xs' : 'text-[#525252] text-xs'}>
                      {s.autoRenew ? 'Yes' : 'No'}
                    </span>
                  </Td>
                </Tr>
              ))}
            </Table>
            <div className="mt-3 pt-3 border-t border-white/6 flex gap-6 text-sm">
              <div>
                <span className="text-[#525252]">Lifetime value </span>
                <span className="text-accent font-medium">
                  ${subs.reduce((a, s) => a + s.revenue, 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-[#525252]">Active now </span>
                <span className="text-white font-medium">
                  {subs.some(s => s.status === 'active') ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Device & Push Token */}
      <Card>
        <SectionHeader title="Device & Push Token" />
        <div className="space-y-0 text-sm">
          {[
            { label: 'Platform',     value: user.platform === 'ios' ? '🍎 iOS' : '🤖 Android', highlight: false },
            { label: 'Push token',   value: user.pushToken ?? 'Not registered',                 highlight: false },
            { label: 'Token status', value: user.pushTokenStatus ?? 'Unknown',                  highlight: user.pushTokenStatus === 'registered' },
            { label: 'Last seen',    value: user.lastActive,                                     highlight: false },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-2.5 border-b border-white/4">
              <span className="text-[#737373]">{row.label}</span>
              <span className={row.highlight ? 'text-green-400' : 'text-white'}>{row.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Activity Log */}
      <Card>
        <SectionHeader title="Account Activity" sub="Last 10 actions" />
        {activity.length === 0 ? (
          <div className="py-4 text-sm text-[#525252] text-center">No activity recorded.</div>
        ) : (
          <Table headers={['Action', 'Time']}>
            {activity.map((a, i) => (
              <Tr key={i}>
                <Td><span className="text-[#d4d4d4]">{a.action}</span></Td>
                <Td>
                  <span className="text-xs text-[#525252] whitespace-nowrap">
                    {new Date(a.at).toLocaleString()}
                  </span>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Modals */}
      <ConfirmModal
        open={banModal}
        onClose={() => setBanModal(false)}
        onConfirm={handleBan}
        title={isBanned ? 'Unban account' : 'Ban account'}
        message={isBanned
          ? `This will restore ${user.name}'s access to 3TABZ immediately.`
          : `This blocks ${user.name} from logging in. Their data is preserved.`}
        confirmLabel={isBanned ? 'Unban' : 'Ban user'}
        danger={!isBanned}
      />
      <ConfirmModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete account permanently"
        message={`Schedules ${user.name}'s account and all data for permanent deletion after 30 days. Cannot be undone.`}
        confirmLabel={actionId === 'delete' ? 'Deleting…' : 'Schedule deletion'}
        danger
      />
    </div>
  )
}