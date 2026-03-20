'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { SectionHeader, Card, Table, Tr, Td, Badge, Button, Input, Select, Textarea } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { Send, Clock, Users, Smartphone, BookmarkPlus, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { Broadcast } from '@/lib/api'

type Target  = 'all' | 'free' | 'pro'
type MsgType = 'general' | 'event' | 'holiday' | 'health_tip' | 'feature'
type Template = { id: string; name: string; title: string; body: string; type: string }

const SEED_TEMPLATES: Template[] = [
  { id: 't1', name: 'Weekly Reminder', title: "How's your health this week?", body: 'Check your adherence score and see your progress. Keep it up!', type: 'general' },
  { id: 't2', name: 'Christmas', title: 'Merry Christmas from 3TABZ 🎄', body: "Wishing you a healthy and joyful holiday season. Don't forget your medications!", type: 'holiday' },
  { id: 't3', name: 'New Year',  title: 'Happy New Year! 🎉', body: 'New year, healthier you. Track your first dose of the year with 3TABZ.', type: 'holiday' },
]

const targetLabels: Record<Target, string> = {
  all:  'All users',
  free: 'Free users only',
  pro:  'Pro users only',
}
const typeColors: Record<string, string> = {
  general: 'gray', event: 'yellow', holiday: 'accent', health_tip: 'green', feature: 'green',
}

export default function NotificationsPage() {
  const { success, error: toastError } = useToast()

  const [title,         setTitle]         = useState('')
  const [body,          setBody]          = useState('')
  const [target,        setTarget]        = useState<Target>('all')
  const [type,          setType]          = useState<MsgType>('general')
  const [deepLink,      setDeepLink]      = useState('')
  const [schedule,      setSchedule]      = useState('now')
  const [scheduleTime,  setScheduleTime]  = useState('')
  const [previewTab,    setPreviewTab]    = useState<'ios' | 'android'>('ios')
  const [confirm,       setConfirm]       = useState(false)
  const [sending,       setSending]       = useState(false)
  const [undoSecs,      setUndoSecs]      = useState(0)
  const [pendingBcast,  setPendingBcast]  = useState<Broadcast | null>(null)
  const [history,       setHistory]       = useState<Broadcast[]>([])
  const [historyLoading,setHistoryLoading]= useState(true)
  const [historyError,  setHistoryError]  = useState('')
  const [templates,     setTemplates]     = useState<Template[]>(SEED_TEMPLATES)
  const [saveName,      setSaveName]      = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)
  const undoRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadHistory = useCallback(async () => {
    try {
      const data = await api.getBroadcasts()
      setHistory(data)
    } catch (e: any) {
      setHistoryError(e?.message ?? 'Failed to load broadcast history')
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => { loadHistory() }, [loadHistory])

  // Undo countdown
  useEffect(() => {
    if (undoSecs <= 0) {
      if (undoRef.current) clearInterval(undoRef.current)
      // Fire the real API call when countdown reaches 0 (and there's a pending broadcast)
      if (undoSecs === 0 && pendingBcast) {
        commitBroadcast(pendingBcast)
      }
      return
    }
    undoRef.current = setInterval(() => setUndoSecs(s => s - 1), 1000)
    return () => { if (undoRef.current) clearInterval(undoRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoSecs > 0])

  async function commitBroadcast(optimistic: Broadcast) {
    if (!pendingBcast) return
    setPendingBcast(null)
    try {
      const real = await api.sendBroadcast({
        title: optimistic.title,
        body:  optimistic.body,
        target: optimistic.target,
        type:   optimistic.type,
        deepLink: deepLink || undefined,
        scheduledAt: schedule === 'schedule' && scheduleTime ? scheduleTime : undefined,
      })
      // Replace optimistic entry with real one
      setHistory(h => [real, ...h.filter(b => b.id !== optimistic.id)])
      success('Broadcast sent successfully')
    } catch (e: any) {
      // Remove optimistic entry on failure
      setHistory(h => h.filter(b => b.id !== optimistic.id))
      toastError(e?.message ?? 'Failed to send broadcast')
    }
  }

  const handleSend = async () => {
    if (!confirm) { setConfirm(true); return }
    setConfirm(false)
    setSending(true)

    // Optimistic entry
    const optimistic: Broadcast = {
      id: `opt_${Date.now()}`,
      title, body, type, target,
      sentAt: new Date().toISOString(),
      recipients: target === 'all' ? 0 : target === 'pro' ? 0 : 0,
      delivered: 0, opened: 0, ctr: 0,
    }
    setPendingBcast(optimistic)
    setHistory(h => [optimistic, ...h])
    setTitle(''); setBody(''); setDeepLink(''); setSchedule('now'); setScheduleTime('')
    setUndoSecs(30)
    setSending(false)
  }

  const handleUndo = async () => {
    if (!pendingBcast) return
    setUndoSecs(0)
    if (undoRef.current) clearInterval(undoRef.current)
    setHistory(h => h.filter(b => b.id !== pendingBcast.id))
    setPendingBcast(null)
    success('Broadcast cancelled')
  }

  const canSend = title.trim().length > 0 && body.trim().length > 0

  return (
    <div className="max-w-[1400px] grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">

      {/* Left: Compose */}
      <div className="space-y-4">
        <SectionHeader title="Broadcast Center" sub="Send push notifications to all or targeted users" />

        {/* Templates */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#737373] uppercase tracking-widest">Templates</p>
            <Button variant="ghost" size="sm" onClick={() => setShowSaveInput(v => !v)}>
              <BookmarkPlus size={12} /> Save current
            </Button>
          </div>
          {showSaveInput && (
            <div className="flex gap-2 mb-3">
              <Input placeholder="Template name…" value={saveName} onChange={setSaveName} className="flex-1" />
              <Button variant="primary" size="sm"
                onClick={() => {
                  if (!saveName.trim() || !title.trim() || !body.trim()) return
                  setTemplates(ts => [...ts, { id: `t${Date.now()}`, name: saveName.trim(), title, body, type }])
                  setSaveName(''); setShowSaveInput(false)
                }}
                disabled={!saveName.trim() || !canSend}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSaveInput(false)}>Cancel</Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {templates.map(t => (
              <div key={t.id} className="flex items-center gap-1 border border-white/10 pr-1">
                <button onClick={() => { setTitle(t.title); setBody(t.body); setType(t.type as MsgType) }}
                  className="text-xs px-3 py-1.5 text-[#a3a3a3] hover:text-white transition-colors">
                  {t.name}
                </button>
                <button onClick={() => setTemplates(ts => ts.filter(x => x.id !== t.id))}
                  className="text-[#404040] hover:text-red-400 transition-colors p-0.5">
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
            {templates.length === 0 && (
              <p className="text-xs text-[#404040]">No templates yet.</p>
            )}
          </div>
        </Card>

        {/* Compose */}
        <Card className="space-y-4">
          <p className="text-xs text-[#737373] uppercase tracking-widest">Compose</p>
          <div className="space-y-1">
            <label className="text-xs text-[#525252]">Title <span className="text-[#404040]">({title.length}/60)</span></label>
            <Input placeholder="Notification title…" value={title} onChange={setTitle} className="w-full" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[#525252]">Body <span className="text-[#404040]">({body.length}/140)</span></label>
            <Textarea placeholder="Write your message…" value={body} onChange={setBody} rows={3} maxLength={140} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-[#525252]">Audience</label>
              <Select value={target} onChange={v => setTarget(v as Target)} options={[
                { value: 'all', label: 'All users' }, { value: 'pro', label: 'Pro only' }, { value: 'free', label: 'Free only' },
              ]} className="w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#525252]">Type</label>
              <Select value={type} onChange={v => setType(v as MsgType)} options={[
                { value: 'general', label: 'General' }, { value: 'feature', label: 'Feature' },
                { value: 'health_tip', label: 'Health tip' }, { value: 'event', label: 'Event' }, { value: 'holiday', label: 'Holiday' },
              ]} className="w-full" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[#525252]">Deep link <span className="text-[#404040]">(optional)</span></label>
            <Input placeholder="3tabz://analytics" value={deepLink} onChange={setDeepLink} className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-[#525252]">Send timing</label>
              <Select value={schedule} onChange={setSchedule} options={[
                { value: 'now', label: 'Send immediately' }, { value: 'schedule', label: 'Schedule' },
              ]} className="w-full" />
            </div>
            {schedule === 'schedule' && (
              <div className="space-y-1">
                <label className="text-xs text-[#525252]">Date & time</label>
                <Input type="datetime-local" value={scheduleTime} onChange={setScheduleTime} className="w-full" />
              </div>
            )}
          </div>

          {undoSecs > 0 && (
            <div className="border border-green-900 bg-green-950/30 p-3 flex items-center justify-between">
              <span className="text-xs text-green-400">✓ Dispatching in {undoSecs}s…</span>
              <Button variant="secondary" size="sm" onClick={handleUndo}>Undo</Button>
            </div>
          )}

          {confirm && (
            <div className="border border-yellow-900 bg-yellow-950/30 p-3 text-xs text-yellow-400">
              <p className="font-medium mb-1">⚠ Confirm broadcast</p>
              <p>Sends to <strong>{targetLabels[target]}</strong>. A 30-second undo window will follow.</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-1">
            <span className="text-xs text-[#525252] flex items-center gap-1.5">
              <Users size={11} /> {targetLabels[target]}
            </span>
            <Button variant="primary" onClick={handleSend} disabled={!canSend || undoSecs > 0 || sending}>
              {sending
                ? <Loader2 size={13} className="animate-spin" />
                : confirm
                  ? '⚠ Confirm — start 30s window'
                  : schedule === 'now'
                    ? <><Send size={13} /> Send now</>
                    : <><Clock size={13} /> Schedule</>}
            </Button>
          </div>
        </Card>
      </div>

      {/* Right: Preview + History */}
      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#737373] uppercase tracking-widest">Preview</p>
            <div className="flex border border-white/10">
              {(['ios', 'android'] as const).map(tab => (
                <button key={tab} onClick={() => setPreviewTab(tab)}
                  className={`px-3 py-1 text-xs transition-colors ${previewTab === tab ? 'bg-accent text-black font-medium' : 'text-[#525252] hover:text-white'}`}>
                  {tab === 'ios' ? '🍎 iOS' : '🤖 Android'}
                </button>
              ))}
            </div>
          </div>

          {previewTab === 'ios' ? (
            <div className="bg-[#1c1c1e] rounded-2xl p-4 border border-white/6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center">
                  <Smartphone size={11} className="text-black" />
                </div>
                <span className="text-xs text-[#8e8e93]">3TABZ · now</span>
              </div>
              <p className="text-sm font-semibold text-white mb-0.5 leading-snug">
                {title || <span className="text-[#48484a]">Notification title…</span>}
              </p>
              <p className="text-xs text-[#8e8e93] leading-relaxed">
                {body || <span className="text-[#48484a]">Your message will appear here…</span>}
              </p>
            </div>
          ) : (
            <div className="bg-[#1e1e1e] rounded-lg p-3 border border-white/6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-accent rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Smartphone size={14} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-white">3TABZ</span>
                    <span className="text-xs text-[#737373]">now</span>
                  </div>
                  <p className="text-xs font-medium text-white leading-snug mb-0.5 truncate">
                    {title || <span className="text-[#404040]">Notification title…</span>}
                  </p>
                  <p className="text-xs text-[#a3a3a3] leading-relaxed line-clamp-2">
                    {body || <span className="text-[#404040]">Your message will appear here…</span>}
                  </p>
                </div>
              </div>
            </div>
          )}
          {deepLink && (
            <p className="text-xs text-[#525252] mt-2 flex items-center gap-1">
              <span className="text-accent">→</span> Opens: <code className="text-accent">{deepLink}</code>
            </p>
          )}
        </Card>

        {/* History */}
        <Card>
          <p className="text-xs text-[#737373] uppercase tracking-widest mb-3">Broadcast History</p>
          {historyError && (
            <div className="flex items-center gap-2 text-xs text-red-400 mb-3">
              <AlertCircle size={12} /> {historyError}
            </div>
          )}
          {historyLoading
            ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="animate-pulse bg-white/6 h-20 rounded" />)}</div>
            : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {history.length === 0 && <p className="text-xs text-[#525252]">No broadcasts sent yet.</p>}
                {history.map(b => (
                  <div key={b.id} className={`border p-3 space-y-2 ${b.id.startsWith('opt_') ? 'border-accent/30 bg-accent/5' : 'border-white/6'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-white font-medium leading-tight">{b.title}</p>
                      <Badge color={typeColors[b.type] as any}>{b.type}</Badge>
                    </div>
                    <p className="text-xs text-[#525252] leading-relaxed">{b.body}</p>
                    <div className="flex gap-3 text-xs text-[#525252]">
                      {b.id.startsWith('opt_')
                        ? <span className="text-accent flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Sending…</span>
                        : (
                          <>
                            <span><span className="text-[#a3a3a3]">{b.recipients.toLocaleString()}</span> sent</span>
                            {b.delivered > 0 && <span><span className="text-[#a3a3a3]">{b.delivered.toLocaleString()}</span> delivered</span>}
                            {b.ctr > 0 && <span><span className="text-accent">{b.ctr}%</span> opened</span>}
                          </>
                        )
                      }
                    </div>
                    <p className="text-xs text-[#404040]">{new Date(b.sentAt).toLocaleString()}</p>
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