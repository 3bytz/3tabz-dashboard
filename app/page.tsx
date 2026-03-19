'use client'
import { useEffect, useState } from 'react'
import { StatCard, Card, SectionHeader } from '@/components/ui'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { api } from '@/lib/api'
import type { OverviewStats, SignupDay, ActiveMonth, RevenueMonth } from '@/lib/api'

// ── Skeleton ──────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/6 rounded ${className}`} />
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 px-3 py-2 text-xs">
      <p className="text-[#a3a3a3] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function OverviewPage() {
  const [stats,       setStats]       = useState<OverviewStats | null>(null)
  const [signups,     setSignups]     = useState<SignupDay[]>([])
  const [activeUsers, setActiveUsers] = useState<ActiveMonth[]>([])
  const [revenue,     setRevenue]     = useState<RevenueMonth[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [s, su, au, rev] = await Promise.all([
          api.getOverviewStats(),
          api.getSignupsByDay(),
          api.getActiveUsersTrend(),
          api.getRevenueByMonth(),
        ])
        setStats(s)
        setSignups(su)
        setActiveUsers(au)
        setRevenue(rev)
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load overview data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (error) {
    return (
      <div className="max-w-[1400px]">
        <div className="border border-red-900 bg-red-950/30 text-red-400 text-sm px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/6 border border-white/6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111] p-5"><Skeleton className="h-8 w-20 mb-2" /><Skeleton className="h-3 w-28" /></div>
          ))
        ) : (
          <>
            <StatCard label="Total Users"     value={stats!.totalUsers.toLocaleString()} sub="All time" />
            <StatCard label="Active (30d)"    value={stats!.activeUsers30d.toLocaleString()} sub={`${stats!.activeUsers7d.toLocaleString()} last 7 days`} />
            <StatCard label="Signups Today"   value={stats!.newSignupsToday} sub={`${stats!.newSignupsWeek} this week`} accent />
            <StatCard label="Conversion Rate" value={`${stats!.conversionRate}%`} sub="Free → Pro" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/6 border border-white/6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111] p-5"><Skeleton className="h-8 w-20 mb-2" /><Skeleton className="h-3 w-28" /></div>
          ))
        ) : (
          <>
            <StatCard label="MRR"               value={`$${stats!.mrr.toLocaleString()}`} sub={`$${stats!.arr.toLocaleString()} ARR`} accent />
            <StatCard label="Pro Subscribers"   value={stats!.totalSubscriptions.toLocaleString()} sub="Active subscriptions" />
            <StatCard label="Total Doses Logged" value={stats!.totalDosesLogged.toLocaleString()} sub="All time" />
            <StatCard label="Churn (30d)"        value={`${stats!.churnRate30d}%`} sub="Subscription churn" />
          </>
        )}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Daily Signups" sub="Last 30 days" />
          {loading
            ? <Skeleton className="h-[200px] w-full mt-2" />
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={signups} barSize={8}>
                  <CartesianGrid strokeDasharray="0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} interval={6} />
                  <YAxis tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="signups" fill="#C8F135" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </Card>

        <Card>
          <SectionHeader title="Monthly Active Users" sub="Last 6 months" />
          {loading
            ? <Skeleton className="h-[200px] w-full mt-2" />
            : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={activeUsers}>
                  <CartesianGrid strokeDasharray="0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="users" stroke="#C8F135" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="MRR Growth" sub="Monthly recurring revenue" />
          {loading
            ? <Skeleton className="h-[200px] w-full mt-2" />
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenue} barSize={32}>
                  <CartesianGrid strokeDasharray="0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} width={40} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="mrr" fill="#ffffff" fillOpacity={0.12} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </Card>

        <Card>
          <SectionHeader title="Quick Stats" />
          {loading
            ? <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            : (
              <div className="space-y-3">
                {[
                  { label: 'Total medications tracked', value: stats!.totalMedications.toLocaleString() },
                  { label: 'Doses logged all time',      value: stats!.totalDosesLogged.toLocaleString() },
                  { label: 'New signups this week',       value: stats!.newSignupsWeek },
                  { label: 'Active 7-day users',          value: stats!.activeUsers7d.toLocaleString() },
                  { label: 'Pro subscribers',             value: stats!.totalSubscriptions.toLocaleString() },
                  { label: 'Estimated ARR',               value: `$${stats!.arr.toLocaleString()}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/4 text-sm">
                    <span className="text-[#737373]">{row.label}</span>
                    <span className="text-white font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            )
          }
        </Card>
      </div>
    </div>
  )
}