'use client'
import { useEffect, useState, useCallback } from 'react'
import { StatCard, Card, SectionHeader, Table, Tr, Td, Badge, StatusDot } from '@/components/ui'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import type { AppHealth, ErrorByEndpoint } from '@/lib/api'

const PIE_COLORS = ['#C8F135', '#525252']
const VER_COLORS = ['#C8F135', '#a3a3a3', '#525252', '#333333']

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/6 rounded ${className}`} />
}

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 px-3 py-2 text-xs">
      <p className="text-[#a3a3a3] mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}ms</p>
      ))}
    </div>
  )
}

export default function HealthPage() {
  const [health,  setHealth]  = useState<AppHealth | null>(null)
  const [errors,  setErrors]  = useState<ErrorByEndpoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const load = useCallback(async () => {
    setError(''); setLoading(true)
    try {
      const [h, e] = await Promise.all([
        api.getAppHealth(),
        api.getErrorsByEndpoint(),
      ])
      setHealth(h)
      setErrors(e)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load health data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [load])

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

      {/* Service status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/6 border border-white/6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111] p-5"><Skeleton className="h-10 w-full" /></div>
          ))
        ) : (
          [
            { name: 'API Server',   status: health!.apiStatus   },
            { name: 'Database',     status: health!.dbStatus    },
            { name: 'Redis Cache',  status: health!.redisStatus },
            { name: 'Push Service', status: health!.pushStatus  },
          ].map(s => (
            <div key={s.name} className="bg-[#111] p-5 flex items-center gap-3">
              <StatusDot status={s.status as any} />
              <div>
                <div className="text-xs text-[#737373] uppercase tracking-widest">{s.name}</div>
                <div className="text-sm text-white font-medium capitalize">{s.status}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Perf stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/6 border border-white/6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111] p-5"><Skeleton className="h-8 w-24 mb-2" /><Skeleton className="h-3 w-32" /></div>
          ))
        ) : (
          <>
            <StatCard label="p50 Response" value={`${health!.p50ResponseMs}ms`} accent />
            <StatCard label="p95 Response" value={`${health!.p95ResponseMs}ms`} />
            <StatCard label="p99 Response" value={`${health!.p99ResponseMs}ms`} />
            <StatCard label="Error Rate"   value={`${health!.errorRatePct}%`}   sub="Last 24h" />
          </>
        )}
      </div>

      {/* Response times + push tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionHeader title="Response Times" sub="p50 and p95 — last 6 hours" />
          {loading
            ? <Skeleton className="h-[200px] w-full mt-2" />
            : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={health!.responseTimeSeries}>
                  <CartesianGrid strokeDasharray="0" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} width={44} tickFormatter={v => `${v}ms`} />
                  <Tooltip content={<ChartTip />} />
                  <Line type="monotone" dataKey="p50" stroke="#C8F135" strokeWidth={2} dot={false} name="p50" />
                  <Line type="monotone" dataKey="p95" stroke="#525252" strokeWidth={2} dot={false} name="p95" strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </Card>

        <Card>
          <SectionHeader title="Push Tokens" sub={loading ? '…' : `${health!.activePushTokens.toLocaleString()} registered`} />
          {loading
            ? <Skeleton className="h-[130px] w-full" />
            : (
              <>
                <div className="flex justify-center my-1">
                  <PieChart width={130} height={130}>
                    <Pie data={[
                      { name: 'iOS',     value: health!.iosTokens     },
                      { name: 'Android', value: health!.androidTokens },
                    ]} cx={60} cy={60} innerRadius={38} outerRadius={58} dataKey="value" strokeWidth={0}>
                      {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                  </PieChart>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'iOS',     count: health!.iosTokens,     color: 'text-accent'    },
                    { label: 'Android', count: health!.androidTokens, color: 'text-[#737373]' },
                  ].map(p => (
                    <div key={p.label} className="flex justify-between text-sm">
                      <span className="text-[#737373]">{p.label}</span>
                      <span className={p.color}>{p.count.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm border-t border-white/6 pt-2">
                    <span className="text-[#737373]">Failed (24h)</span>
                    <span className="text-red-400">{health!.failedPushes24h}</span>
                  </div>
                </div>
              </>
            )
          }
        </Card>
      </div>

      {/* Error rate by endpoint */}
      <Card>
        <SectionHeader
          title="Error Rate by Endpoint"
          sub="Endpoints with the highest absolute error counts in the last 24h"
        />
        {loading
          ? <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          : errors.length === 0
            ? <div className="py-6 text-center text-sm text-[#525252]">No error data available.</div>
            : (
              <Table headers={['Endpoint', 'Requests', 'Errors', 'Error %', 'Severity']}>
                {errors.map(e => (
                  <Tr key={e.endpoint}>
                    <Td><code className="text-xs text-accent font-mono">{e.endpoint}</code></Td>
                    <Td><span className="text-[#a3a3a3]">{e.requests.toLocaleString()}</span></Td>
                    <Td><span className="text-white font-medium">{e.errors}</span></Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/6 rounded-full overflow-hidden">
                          <div className="h-1.5 rounded-full" style={{
                            width: `${Math.min(e.errorPct * 10, 100)}%`,
                            backgroundColor: e.errorPct > 3 ? '#f87171' : e.errorPct > 1 ? '#facc15' : '#C8F135',
                          }} />
                        </div>
                        <span className={`text-xs font-medium ${e.errorPct > 3 ? 'text-red-400' : e.errorPct > 1 ? 'text-yellow-400' : 'text-accent'}`}>
                          {e.errorPct}%
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <Badge color={e.errorPct > 3 ? 'red' : e.errorPct > 1 ? 'yellow' : 'green'}>
                        {e.errorPct > 3 ? 'high' : e.errorPct > 1 ? 'elevated' : 'normal'}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Table>
            )
        }
      </Card>

      {/* Version distribution */}
      <Card>
        <SectionHeader title="App Version Distribution" />
        {loading
          ? <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
          : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {health!.versionDistribution.map((v, i) => (
                <div key={v.version} className="bg-[#0a0a0a] border border-white/6 p-3">
                  <div className="text-xs text-[#525252] mb-1">v{v.version}</div>
                  <div className="text-xl font-display font-bold text-white mb-2">{v.pct}%</div>
                  <div className="h-1 bg-white/6 rounded mb-1">
                    <div className="h-1 rounded" style={{ width: `${v.pct}%`, backgroundColor: VER_COLORS[i] }} />
                  </div>
                  <div className="text-xs text-[#525252]">{v.count.toLocaleString()} users</div>
                </div>
              ))}
            </div>
          )
        }
      </Card>

      {/* Cron jobs */}
      <Card>
        <SectionHeader title="Background Jobs" sub="Cron status and last run" />
        {loading
          ? <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          : (
            <Table headers={['Job', 'Schedule', 'Last Run', 'Duration', 'Status']}>
              {health!.cronJobs.map(job => (
                <Tr key={job.name}>
                  <Td><code className="text-xs text-accent font-mono">{job.name}</code></Td>
                  <Td><code className="text-xs text-[#525252] font-mono">{job.schedule}</code></Td>
                  <Td><span className="text-xs text-[#525252]">{new Date(job.lastRun).toLocaleString()}</span></Td>
                  <Td><span className="text-xs text-[#a3a3a3]">{job.durationMs}ms</span></Td>
                  <Td>
                    <Badge color={job.status === 'success' ? 'green' : job.status === 'running' ? 'yellow' : 'red'}>
                      {job.status}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Table>
          )
        }
      </Card>
    </div>
  )
}