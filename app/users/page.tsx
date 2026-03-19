'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SectionHeader, Table, Tr, Td, Badge, Button, Input, Select } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { MoreHorizontal, UserX, ShieldCheck, RefreshCw, ExternalLink, Download, Loader2, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { User } from '@/lib/api'

type Plan   = 'all' | 'free' | 'pro'
type Status = 'all' | 'active' | 'inactive' | 'banned'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/6 rounded ${className}`} />
}

export default function UsersPage() {
  const { success, error: toastError, info, warning } = useToast()

  const [users,      setUsers]      = useState<User[]>([])
  const [loading,    setLoading]    = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [actionId,   setActionId]   = useState<string | null>(null)

  const [search,   setSearch]   = useState('')
  const [plan,     setPlan]     = useState<Plan>('all')
  const [status,   setStatus]   = useState<Status>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setFetchError('')
      const data = await api.getUsers()
      setUsers(data)
    } catch (e: any) {
      setFetchError(e?.message ?? 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchPlan   = plan   === 'all' || u.plan   === plan
    const matchStatus = status === 'all' || u.status === status
    const matchFrom   = !dateFrom || u.joined >= dateFrom
    const matchTo     = !dateTo   || u.joined <= dateTo
    return matchSearch && matchPlan && matchStatus && matchFrom && matchTo
  }), [users, search, plan, status, dateFrom, dateTo])

  const selectedUser = users.find(u => u.id === selected)

  const handleBan = async (user: User) => {
    setActionId(user.id)
    try {
      if (user.status === 'banned') {
        await api.unbanUser(user.id)
        setUsers(us => us.map(u => u.id === user.id ? { ...u, status: 'active' } : u))
        info(`${user.name} has been unbanned`)
      } else {
        await api.banUser(user.id)
        setUsers(us => us.map(u => u.id === user.id ? { ...u, status: 'banned' } : u))
        warning(`${user.name} has been banned`)
      }
    } catch (e: any) {
      toastError(e?.message ?? 'Action failed')
    } finally {
      setActionId(null)
    }
  }

  const handleGrantPro = async (user: User) => {
    setActionId(user.id)
    try {
      await api.grantPro(user.id)
      setUsers(us => us.map(u => u.id === user.id ? { ...u, plan: 'pro' } : u))
      success(`Pro access granted to ${user.name}`)
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to grant Pro')
    } finally {
      setActionId(null)
    }
  }

  const handleResetPassword = async (user: User) => {
    setActionId(user.id)
    try {
      await api.resetPassword(user.id)
      success(`Password reset email sent to ${user.email}`)
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to send reset email')
    } finally {
      setActionId(null)
    }
  }

  const exportCSV = () => {
    const header = 'Name,Email,Plan,Collections,Medications,Country,Joined,LastActive,Status'
    const rows   = filtered.map(u =>
      `"${u.name}",${u.email},${u.plan},${u.collections},${u.medications},${u.country},${u.joined},${u.lastActive},${u.status}`)
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a    = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob), download: '3tabz-users.csv',
    })
    a.click()
    success(`Exported ${filtered.length} users to CSV`)
  }

  if (fetchError) {
    return (
      <div className="max-w-[1400px] space-y-4">
        <div className="flex items-center gap-3 border border-red-900 bg-red-950/30 text-red-400 text-sm px-4 py-3">
          <AlertCircle size={14} />
          {fetchError}
          <button onClick={load} className="ml-auto underline hover:no-underline">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] space-y-4">

      <SectionHeader
        title="Users"
        sub={loading ? 'Loading…' : `${filtered.length} of ${users.length} · ${users.filter(u => u.status === 'active').length} active`}
        action={
          <Button variant="secondary" size="sm" onClick={exportCSV} disabled={loading}>
            <Download size={12} /> Export CSV
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search name or email…" value={search} onChange={setSearch} className="w-52" />
        <Select value={plan} onChange={v => setPlan(v as Plan)} options={[
          { value: 'all', label: 'All plans' }, { value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' },
        ]} />
        <Select value={status} onChange={v => setStatus(v as Status)} options={[
          { value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }, { value: 'banned', label: 'Banned' },
        ]} />
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#525252]">Joined from</span>
          <Input type="date" value={dateFrom} onChange={setDateFrom} className="w-36" />
          <span className="text-xs text-[#525252]">to</span>
          <Input type="date" value={dateTo} onChange={setDateTo} className="w-36" />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo('') }}
              className="text-xs text-[#525252] hover:text-white transition-colors">Clear ✕</button>
          )}
        </div>
      </div>

      <div className="border border-white/8 bg-[#111]">
        <Table headers={['User', 'Plan', 'Collections', 'Meds', 'Country', 'Joined', 'Last Active', 'Status', '']}>
          {loading && Array.from({ length: 8 }).map((_, i) => (
            <Tr key={i}>
              {Array.from({ length: 9 }).map((_, j) => (
                <Td key={j}><Skeleton className="h-4 w-full" /></Td>
              ))}
            </Tr>
          ))}
          {!loading && filtered.length === 0 && (
            <Tr>
              <Td className="text-[#525252] py-8 text-center">No users match the current filters.</Td>
            </Tr>
          )}
          {!loading && filtered.map(u => (
            <Tr key={u.id} className={selected === u.id ? 'bg-accent/5' : ''}>
              <Td>
                <div className="text-white text-sm font-medium">{u.name}</div>
                <div className="text-xs text-[#525252]">{u.email}</div>
              </Td>
              <Td><Badge color={u.plan === 'pro' ? 'accent' : 'gray'}>{u.plan.toUpperCase()}</Badge></Td>
              <Td><span className="text-[#a3a3a3]">{u.collections}</span></Td>
              <Td><span className="text-[#a3a3a3]">{u.medications}</span></Td>
              <Td><span className="text-[#a3a3a3] uppercase text-xs">{u.country}</span></Td>
              <Td><span className="text-[#525252] text-xs">{u.joined}</span></Td>
              <Td><span className="text-[#525252] text-xs">{u.lastActive}</span></Td>
              <Td>
                <Badge color={u.status === 'active' ? 'green' : u.status === 'banned' ? 'red' : 'gray'}>
                  {u.status}
                </Badge>
              </Td>
              <Td>
                <div className="flex items-center gap-1">
                  <Link href={`/users/${u.id}`}>
                    <Button variant="ghost" size="sm"><ExternalLink size={11} /> View</Button>
                  </Link>
                  <button onClick={() => setSelected(selected === u.id ? null : u.id)}
                    className="p-1.5 text-[#525252] hover:text-white transition-colors">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </div>

      {/* Quick-action panel */}
      {selectedUser && (
        <div className="border border-white/8 bg-[#111] p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-white">{selectedUser.name}</h3>
              <p className="text-xs text-[#525252]">{selectedUser.email} · ID: {selectedUser.id}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-[#525252] hover:text-white">Close ✕</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Plan',        value: selectedUser.plan.toUpperCase() },
              { label: 'Collections', value: selectedUser.collections },
              { label: 'Medications', value: selectedUser.medications },
              { label: 'Platform',    value: selectedUser.platform.toUpperCase() },
            ].map(s => (
              <div key={s.label} className="bg-[#0a0a0a] border border-white/6 p-3">
                <div className="text-xs text-[#525252] mb-1">{s.label}</div>
                <div className="text-white font-medium text-sm">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Link href={`/users/${selectedUser.id}`}>
              <Button variant="secondary" size="sm"><ExternalLink size={12} /> Full profile</Button>
            </Link>
            <Button variant="secondary" size="sm"
              disabled={actionId === selectedUser.id}
              onClick={() => handleResetPassword(selectedUser)}>
              {actionId === selectedUser.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              Reset password
            </Button>
            {selectedUser.plan === 'free' && (
              <Button variant="primary" size="sm"
                disabled={actionId === selectedUser.id}
                onClick={() => handleGrantPro(selectedUser)}>
                {actionId === selectedUser.id ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                Grant Pro
              </Button>
            )}
            <Button variant="danger" size="sm"
              disabled={actionId === selectedUser.id}
              onClick={() => handleBan(selectedUser)}>
              {actionId === selectedUser.id ? <Loader2 size={12} className="animate-spin" /> : <UserX size={12} />}
              {selectedUser.status === 'banned' ? 'Unban' : 'Ban account'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}