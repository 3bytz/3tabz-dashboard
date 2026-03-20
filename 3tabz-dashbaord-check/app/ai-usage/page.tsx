'use client'
import { useEffect, useState } from 'react'
import { StatCard, Card, SectionHeader, Table, Tr, Td, Badge } from '@/components/ui'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import type { AIUsageStats } from '@/lib/api'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/6 rounded ${className}`} />
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 px-3 py-2 text-xs">
      <p className="text-[#a3a3a3] mb-1">{label}</p>
      <p className="text-accent">{payload[0].value} requests</p>
    </div>
  )
}

export default function AIUsagePage() {
  const [data,    setData]    = useState<AIUsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  async function load() {
    setError(''); setLoading(true)
    try {
      setData(await api.getAIUsageStats())
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load AI usage stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (error) {
    return (
      <div className="max-w-[1400px]">
        <div className="flex items-center gap-3 border border-red-900 bg-red-950/30 text-red-400 text-sm px-4 py-3">
          <AlertCircle size={14} /> {error}
          <button onClick={load} className="ml-auto flex items-center gap-1 underline hover:no-underline">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/6 border border-white/6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111] p-5"><Skeleton className="h-8 w-24 mb-2" /><Skeleton className="h-3 w-32" /></div>
          ))
        ) : (
          <>
            <StatCard label="Requests Today"      value={data!.requestsToday.toLocaleString()} sub="24h window" accent />
            <StatCard label="Requests This Month"  value={data!.requestsThisMonth.toLocaleString()} />
            <StatCard label="Cost This Month"      value={`$${data!.estimatedCostMonth}`} sub={`$${data!.estimatedCostTotal} total`} />
            <StatCard label="Error Rate"           value={`${data!.errorRate}%`} sub={`${data!.avgResponseMs}ms avg`} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <SectionHeader title="Daily AI Requests" sub="Last 7 days" />
          {loading
            ? <Skeleton className="h-[200px] w-full mt-2" />
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data!.dailyRequests} barSize={28}>
                  <CartesianGrid strokeDasharray="0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="requests" fill="#C8F135" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </Card>

        <Card>
          <SectionHeader title="Top Queried Medications" sub="Most looked-up in AI features" />
          {loading
            ? <div className="space-y-2 mt-1">{Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            : (
              <div className="space-y-2 mt-1">
                {data!.topMedications.map((med, i) => {
                  const pct = Math.round(100 - i * 11)
                  return (
                    <div key={med} className="flex items-center gap-3">
                      <span className="text-xs text-[#525252] w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-white">{med}</span>
                          <span className="text-xs text-[#525252]">{pct}%</span>
                        </div>
                        <div className="h-1 bg-white/6 rounded">
                          <div className="h-1 bg-accent rounded" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </Card>
      </div>

      <Card>
        <SectionHeader title="Endpoint Breakdown" sub="Requests and estimated OpenAI cost per endpoint" />
        {loading
          ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          : (
            <Table headers={['Endpoint', 'Calls (total)', 'Est. Cost (USD)', 'Share', 'Status']}>
              {data!.topEndpoints.map(e => {
                const share = ((e.calls / data!.totalRequests) * 100).toFixed(1)
                return (
                  <Tr key={e.endpoint}>
                    <Td><code className="text-xs text-accent font-mono">{e.endpoint}</code></Td>
                    <Td><span className="text-white">{e.calls.toLocaleString()}</span></Td>
                    <Td><span className="text-white">${e.costUsd.toFixed(2)}</span></Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1 bg-white/6 rounded">
                          <div className="h-1 bg-accent/60 rounded" style={{ width: `${share}%` }} />
                        </div>
                        <span className="text-xs text-[#525252]">{share}%</span>
                      </div>
                    </Td>
                    <Td><Badge color="green">Active</Badge></Td>
                  </Tr>
                )
              })}
            </Table>
          )
        }
      </Card>
    </div>
  )
}