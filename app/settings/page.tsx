'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, SectionHeader, Button, Input, Select } from '@/components/ui'
import { ConfirmModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { Shield, Bell, Cpu, Users, ToggleLeft, ToggleRight, Globe, Clock, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import type { AppSettings, AdminUser } from '@/lib/api'

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/6 rounded ${className}`} />
}

function Toggle({ label, sub, value, onChange, disabled }: {
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/4">
      <div>
        <div className="text-sm text-white">{label}</div>
        {sub && <div className="text-xs text-[#525252] mt-0.5">{sub}</div>}
      </div>
      <button onClick={() => !disabled && onChange(!value)}
        className={`flex-shrink-0 transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : 'text-[#737373] hover:text-white'}`}>
        {value ? <ToggleRight size={26} className="text-accent" /> : <ToggleLeft size={26} />}
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { success, error: toastError, info, warning } = useToast()

  const [settings,    setSettings]    = useState<AppSettings | null>(null)
  const [admins,      setAdmins]      = useState<AdminUser[]>([])
  const [loading,     setLoading]     = useState(true)
  const [fetchError,  setFetchError]  = useState('')
  const [savingFlags, setSavingFlags] = useState(false)
  const [savingLimits,setSavingLimits]= useState(false)
  const [savingIp,    setSavingIp]    = useState(false)
  const [savingCrons, setSavingCrons] = useState(false)
  const [actionId,    setActionId]    = useState<string | null>(null)

  const [inviteEmail,    setInviteEmail]    = useState('')
  const [inviteFullName, setInviteFullName] = useState('')
  const [inviteRole,     setInviteRole]     = useState('admin')
  const [inviting,     setInviting]     = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<AdminUser | null>(null)
  const [newIp,        setNewIp]        = useState('')

  // Local mutable copies
  const [flags,  setFlags]  = useState<AppSettings['flags'] | null>(null)
  const [limits, setLimits] = useState<AppSettings['broadcastLimits'] | null>(null)
  const [ip,     setIp]     = useState<AppSettings['ipAllowlist'] | null>(null)
  const [crons,  setCrons]  = useState<AppSettings['cronJobs'] | null>(null)

  const load = useCallback(async () => {
    setFetchError(''); setLoading(true)
    try {
      const [s, a] = await Promise.all([api.getSettings(), api.getAdmins()])
      setSettings(s)
      setFlags(s.flags)
      setLimits(s.broadcastLimits)
      setIp(s.ipAllowlist)
      setCrons(s.cronJobs)
      setAdmins(a)
    } catch (e: any) {
      setFetchError(e?.message ?? 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const saveFlags = async () => {
    if (!flags) return
    setSavingFlags(true)
    try {
      await api.updateFeatureFlags(flags)
      success('Feature flags saved')
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to save flags')
      setFlags(settings!.flags) // rollback
    } finally {
      setSavingFlags(false)
    }
  }

  const setFlag = (k: keyof AppSettings['flags']) => (v: boolean) => {
    setFlags(f => f ? { ...f, [k]: v } : f)
    if (k === 'maintenanceMode') {
      v ? warning('Maintenance mode enabled — users will see the in-app banner') : info('Maintenance mode disabled')
    }
  }

  const saveLimits = async () => {
    if (!limits) return
    setSavingLimits(true)
    try {
      await api.updateBroadcastLimits(limits)
      success('Broadcast limits saved')
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to save limits')
    } finally {
      setSavingLimits(false)
    }
  }

  const saveIpList = async () => {
    if (!ip) return
    setSavingIp(true)
    try {
      await api.updateIpAllowlist(ip)
      success('IP allowlist saved')
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to save IP list')
    } finally {
      setSavingIp(false)
    }
  }

  const saveCrons = async () => {
    if (!crons) return
    setSavingCrons(true)
    try {
      await api.updateCronSchedules(crons)
      success('Cron schedules saved — changes take effect at next cycle')
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to save cron schedules')
    } finally {
      setSavingCrons(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteFullName.trim()) return
    setInviting(true)
    try {
      const newAdmin = await api.inviteAdmin(inviteEmail, inviteFullName, inviteRole)
      setAdmins(a => [...a, newAdmin])
      setInviteEmail('')
      setInviteFullName('')
      success(`Invite sent to ${inviteEmail}`)
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to send invite')
    } finally {
      setInviting(false)
    }
  }

  const handleRevoke = async () => {
    if (!revokeTarget) return
    setActionId(revokeTarget.id)
    try {
      await api.revokeAdmin(revokeTarget.id)
      setAdmins(a => a.filter(x => x.id !== revokeTarget.id))
      warning(`${revokeTarget.email}'s admin access has been revoked`)
    } catch (e: any) {
      toastError(e?.message ?? 'Failed to revoke access')
    } finally {
      setActionId(null); setRevokeTarget(null)
    }
  }

  if (fetchError) {
    return (
      <div className="max-w-[860px]">
        <div className="flex items-center gap-3 border border-red-900 bg-red-950/30 text-red-400 text-sm px-4 py-3">
          <AlertCircle size={14} /> {fetchError}
          <button onClick={load} className="ml-auto flex items-center gap-1 underline hover:no-underline">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[860px] space-y-5">

      {/* Feature Flags */}
      <Card>
        <SectionHeader title="Feature Flags"
          sub="Toggle platform features globally. Changes take effect immediately."
          action={<Cpu size={16} className="text-[#525252]" />} />
        {loading || !flags ? (
          <div className="space-y-0">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-1" />)}</div>
        ) : (
          <>
            <Toggle label="Maintenance Mode"
              sub="Shows an in-app banner to all users. Blocks new logins."
              value={flags.maintenanceMode} onChange={setFlag('maintenanceMode')} />
            <Toggle label="AI Features"
              sub="Enable all /ai-suggestions/* endpoints. Disable during OpenAI outages."
              value={flags.aiEnabled} onChange={setFlag('aiEnabled')} />
            <Toggle label="Occurrence Alerts"
              sub="Server-side occurrence prediction push notifications."
              value={flags.occurrenceAlerts} onChange={setFlag('occurrenceAlerts')} />
            <Toggle label="New Registrations"
              sub="Allow new users to sign up. Disable for controlled rollout."
              value={flags.newRegistrations} onChange={setFlag('newRegistrations')} />
            <Toggle label="Pro Upgrades"
              sub="Allow users to purchase Pro subscriptions via in-app purchase."
              value={flags.proUpgrades} onChange={setFlag('proUpgrades')} />
            <Toggle label="Data Export Requests"
              sub="Allow users to request their data export from the Privacy & Data screen."
              value={flags.dataExports} onChange={setFlag('dataExports')} />
            <div className="pt-3">
              <Button variant="primary" size="sm" onClick={saveFlags} disabled={savingFlags}>
                {savingFlags ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : 'Save flags'}
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Broadcast Limits */}
      <Card>
        <SectionHeader title="Broadcast Limits"
          sub="Rate limiting for push notification broadcasts."
          action={<Bell size={16} className="text-[#525252]" />} />
        {loading || !limits ? (
          <div className="grid grid-cols-2 gap-4 mb-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {([
                { key: 'maxPerDay',    label: 'Max broadcasts per day'        },
                { key: 'batchSize',    label: 'Batch size (recipients / job)' },
                { key: 'batchDelayMs', label: 'Delay between batches (ms)'    },
                { key: 'undoSecs',     label: 'Undo window (seconds)'         },
              ] as const).map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-[#525252]">{label}</label>
                  <Input value={String(limits[key])}
                    onChange={v => setLimits(l => l ? { ...l, [key]: Number(v) } : l)}
                    className="w-full" type="number" />
                </div>
              ))}
            </div>
            <Button variant="primary" size="sm" onClick={saveLimits} disabled={savingLimits}>
              {savingLimits ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : 'Save limits'}
            </Button>
          </>
        )}
      </Card>

      {/* Admin Users */}
      <Card>
        <SectionHeader title="Admin Users"
          sub="Manage dashboard access. All admins require TOTP 2FA."
          action={<Users size={16} className="text-[#525252]" />} />
        {loading ? (
          <div className="space-y-0">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 w-full mb-1" />)}</div>
        ) : (
          <>
            <div className="space-y-0 mb-4">
              {admins.map(a => (
                <div key={a.id} className="flex items-center justify-between py-3 border-b border-white/4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{a.name}</span>
                      {a.you && <span className="text-xs text-[#525252] border border-white/10 px-1.5 py-0.5">you</span>}
                    </div>
                    <div className="text-xs text-[#525252]">{a.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-accent border border-accent/20 px-2 py-0.5">{a.role}</span>
                    {!a.you && (
                      actionId === a.id
                        ? <Loader2 size={14} className="animate-spin text-[#525252]" />
                        : <Button variant="danger" size="sm" onClick={() => setRevokeTarget(a)}>Revoke</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col gap-2 flex-1">
                <Input
                  placeholder="Full name (e.g. Jane Smith)"
                  value={inviteFullName}
                  onChange={setInviteFullName}
                  className="w-full"
                />
                <Input
                  placeholder="admin@3tabz.com"
                  value={inviteEmail}
                  onChange={setInviteEmail}
                  className="w-full"
                />
              </div>
              <Select value={inviteRole} onChange={setInviteRole} options={[
                { value: 'super_admin', label: 'Super Admin' },
                { value: 'admin',       label: 'Admin'       },
                { value: 'support',     label: 'Support'     },
              ]} />
              <Button variant="primary" size="sm" onClick={handleInvite} disabled={!inviteEmail.trim() || inviting}>
                {inviting ? <Loader2 size={12} className="animate-spin" /> : 'Invite'}
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* IP Allowlist */}
      <Card>
        <SectionHeader title="IP Allowlist"
          sub="Restrict dashboard access to specific IPs. Disabled = all IPs permitted."
          action={<Globe size={16} className="text-[#525252]" />} />
        {loading || !ip ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <>
            <Toggle label="Enable IP restriction"
              sub={ip.enabled ? 'Only IPs in the list below can access the dashboard.' : 'All IPs are currently permitted.'}
              value={ip.enabled} onChange={v => {
                setIp(x => x ? { ...x, enabled: v } : x)
                v ? warning('IP restriction enabled — ensure your IP is in the list') : info('IP restriction disabled')
              }} />
            <div className="mt-4 space-y-2">
              {ip.ips.map(addr => (
                <div key={addr} className="flex items-center justify-between bg-[#0a0a0a] border border-white/6 px-3 py-2">
                  <code className="text-xs text-accent font-mono">{addr}</code>
                  <button onClick={() => setIp(x => x ? { ...x, ips: x.ips.filter(i => i !== addr) } : x)}
                    className="text-xs text-[#525252] hover:text-red-400 transition-colors">Remove</button>
                </div>
              ))}
              {ip.ips.length === 0 && <p className="text-xs text-[#525252] py-2">No IPs — all traffic would be blocked if enabled.</p>}
            </div>
            <div className="flex gap-2 mt-3">
              <Input placeholder="e.g. 197.210.0.1" value={newIp} onChange={setNewIp} className="flex-1" />
              <Button variant="secondary" size="sm" onClick={() => {
                const t = newIp.trim()
                if (!t || ip.ips.includes(t)) return
                setIp(x => x ? { ...x, ips: [...x.ips, t] } : x)
                setNewIp('')
              }} disabled={!newIp.trim()}>Add IP</Button>
              <Button variant="primary" size="sm" onClick={saveIpList} disabled={savingIp}>
                {savingIp ? <Loader2 size={12} className="animate-spin" /> : 'Save list'}
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Cron Schedules */}
      <Card>
        <SectionHeader title="Cron Schedule Configuration"
          sub="Edit cron expressions and toggle individual jobs. Standard 5-field cron syntax."
          action={<Clock size={16} className="text-[#525252]" />} />
        {loading || !crons ? (
          <div className="space-y-0">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-1" />)}</div>
        ) : (
          <>
            <div className="space-y-0 mb-4">
              {crons.map(job => (
                <div key={job.id} className="flex items-center gap-3 py-3 border-b border-white/4">
                  <button onClick={() => setCrons(c => c ? c.map(x => x.id === job.id ? { ...x, enabled: !x.enabled } : x) : c)}
                    className="flex-shrink-0 text-[#525252] hover:text-white transition-colors">
                    {job.enabled ? <ToggleRight size={20} className="text-accent" /> : <ToggleLeft size={20} />}
                  </button>
                  <code className={`text-xs font-mono flex-1 ${job.enabled ? 'text-accent' : 'text-[#525252]'}`}>
                    {job.name}
                  </code>
                  <Input value={job.schedule}
                    onChange={v => setCrons(c => c ? c.map(x => x.id === job.id ? { ...x, schedule: v } : x) : c)}
                    className="w-36 font-mono text-xs" />
                </div>
              ))}
            </div>
            <Button variant="primary" size="sm" onClick={saveCrons} disabled={savingCrons}>
              {savingCrons ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : 'Save schedules'}
            </Button>
          </>
        )}
      </Card>

      {/* Security (read-only) */}
      <Card>
        <SectionHeader title="Security Configuration"
          sub="Current security settings — edit via environment variables."
          action={<Shield size={16} className="text-[#525252]" />} />
        <div className="space-y-0 text-sm">
          {[
            { label: 'JWT access token expiry',  value: '15 minutes'                      },
            { label: 'Refresh token expiry',      value: '30 days, rotation on use'        },
            { label: 'Login rate limit',           value: '5 attempts / 15 min / IP'       },
            { label: 'AI endpoint rate limit',     value: '20 requests / hour / user'      },
            { label: 'Admin 2FA',                  value: 'TOTP enforced — all roles'      },
            { label: 'Data deletion window',       value: '30 days after request'          },
            { label: 'Token reuse detection',      value: 'Enabled — revokes all sessions' },
            { label: 'Body size limit',            value: '10 KB'                          },
          ].map(row => (
            <div key={row.label} className="flex justify-between py-2.5 border-b border-white/4">
              <span className="text-[#737373]">{row.label}</span>
              <span className="text-white font-medium text-right">{row.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <ConfirmModal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        title="Revoke admin access"
        message={`This immediately removes ${revokeTarget?.email}'s access. They will be signed out on their next request.`}
        confirmLabel="Revoke access"
        danger
      />
    </div>
  )
}