'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { SectionHeader, Card, Table, Tr, Td, Badge, StatCard } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { Gift, CheckCircle2, Clock, Crown, Users, TrendingUp } from 'lucide-react'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/6 rounded ${className}`} />
}

export default function ReferralsPage() {
  const { error: toastError } = useToast()
  const [stats,   setStats]   = useState<any>(null)
  const [recent,  setRecent]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.getReferralStats().catch(() => null),
      api.getRecentReferrals(50).catch(() => []),
    ])
      .then(([s, r]) => {
        setStats(s)
        setRecent(Array.isArray(r) ? r : [])
      })
      .catch(e => toastError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const statusColor = (s: string) =>
    s === 'rewarded' ? 'green' : s === 'completed' ? 'accent' : 'gray'

  return (
    <div className="max-w-[1400px] space-y-6">
      <SectionHeader
        title="Referrals"
        sub="Track referral conversions and Pro rewards granted"
        action={
          <button onClick={load} className="text-xs text-[#525252] hover:text-white transition-colors">
            ↻ Refresh
          </button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/6 border border-white/6">
        {loading ? Array(4).fill(0).map((_,i) => <Skeleton key={i} className="h-20" />) : <>
          <StatCard label="Total referrals"    value={stats?.totalReferrals?.toLocaleString() ?? '0'}    sub="All time" />
          <StatCard label="Completed"          value={stats?.completedReferrals?.toLocaleString() ?? '0'} sub="Friend logged first dose" accent />
          <StatCard label="Rewards granted"    value={stats?.rewardedReferrals?.toLocaleString() ?? '0'}  sub="Pro months given" />
          <StatCard label="Conversion rate"    value={stats?.conversionRate ? `${stats.conversionRate}%` : '0%'} sub="Shared → completed" />
        </>}
      </div>

      {/* How it works + funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Gift size={14} className="text-accent" />
            <p className="text-xs text-[#737373] uppercase tracking-widest">How it works</p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Users,        color: 'text-accent',    label: 'User shares link',   desc: 'User gets a unique TABZ-XXXXXX code from the app (Profile → Invite Friends)' },
              { icon: CheckCircle2, color: 'text-[#737373]', label: 'Friend registers',   desc: 'Friend signs up using the referral link or code at registration' },
              { icon: Crown,        color: 'text-accent',    label: 'Both get Pro free',  desc: 'When friend logs their first dose, both users get 1 month of Pro free' },
            ].map(step => {
              const Icon = step.icon
              return (
                <div key={step.label} className="flex gap-3">
                  <Icon size={16} className={`${step.color} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className="text-sm text-white font-medium">{step.label}</p>
                    <p className="text-xs text-[#525252] mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-accent" />
            <p className="text-xs text-[#737373] uppercase tracking-widest">Conversion funnel</p>
          </div>
          {loading ? <Skeleton className="h-32" /> : (
            <div className="space-y-4">
              {[
                { label: 'Pending — shared, invitee not yet registered', value: stats?.pendingReferrals ?? 0,     barColor: 'bg-white/10' },
                { label: 'Completed — registered, reward not yet given', value: stats?.completedReferrals ?? 0,   barColor: 'bg-accent/40' },
                { label: 'Rewarded — Pro granted to both users',         value: stats?.rewardedReferrals ?? 0,    barColor: 'bg-accent' },
              ].map(row => {
                const total = stats?.totalReferrals ?? 1
                const pct   = total > 0 ? Math.round((row.value / total) * 100) : 0
                return (
                  <div key={row.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[#737373]">{row.label}</span>
                      <span className="text-xs text-white font-medium">{row.value.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/6 rounded overflow-hidden">
                      <div className={`h-1.5 rounded ${row.barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Recent activity table */}
      <Card>
        <SectionHeader title="Recent Referral Activity" sub="Latest referral events across all users" />
        <Table headers={['Referrer', 'Code', 'Invitee', 'Status', 'Completed', 'Rewarded']}>
          {loading
            ? Array(5).fill(0).map((_,i) => (
                <Tr key={i}><Td><Skeleton className="h-8 w-full" /></Td></Tr>
              ))
            : recent.length === 0
            ? (
              <Tr>
                <Td className="text-[#525252] py-10 text-center text-xs" colSpan={6}>
                  No referral activity yet. Users can find their referral link in the app under
                  <strong className="text-white"> Profile → Invite Friends</strong>.
                </Td>
              </Tr>
            )
            : recent.map((r: any) => (
              <Tr key={r.id ?? r._id}>
                <Td>
                  <div className="text-white text-sm">{r.referrerName ?? r.referrerId ?? '—'}</div>
                  <div className="text-xs text-[#525252]">{r.referrerEmail ?? ''}</div>
                </Td>
                <Td>
                  <code className="text-xs text-accent font-mono">{r.code}</code>
                </Td>
                <Td>
                  <div className="text-white text-sm">
                    {r.inviteeName ?? (r.inviteeId ? 'Registered' : '—')}
                  </div>
                  <div className="text-xs text-[#525252]">{r.inviteeEmail ?? ''}</div>
                </Td>
                <Td>
                  <Badge color={statusColor(r.status) as any}>{r.status}</Badge>
                </Td>
                <Td>
                  <span className="text-xs text-[#525252]">
                    {r.completedAt
                      ? new Date(r.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
                      : '—'}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-[#525252]">
                    {r.rewardedAt
                      ? new Date(r.rewardedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
                      : '—'}
                  </span>
                </Td>
              </Tr>
            ))
          }
        </Table>
      </Card>
    </div>
  )
}
