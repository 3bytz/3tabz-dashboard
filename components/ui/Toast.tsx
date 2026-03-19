'use client'
import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { clsx } from 'clsx'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

// ── Context ────────────────────────────────────────────────────
interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void
  success: (message: string) => void
  error:   (message: string) => void
  warning: (message: string) => void
  info:    (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.map(x => x.id === id ? { ...x, _exiting: true } as any : x))
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 300)
  }, [])

  const toast = useCallback((
    message: string,
    variant: ToastVariant = 'info',
    duration = 4000
  ) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(t => [...t, { id, message, variant, duration }])
    if (duration > 0) setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  const success = useCallback((m: string) => toast(m, 'success'), [toast])
  const error   = useCallback((m: string) => toast(m, 'error', 6000), [toast])
  const warning = useCallback((m: string) => toast(m, 'warning', 5000), [toast])
  const info    = useCallback((m: string) => toast(m, 'info'), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// ── Individual Toast item ──────────────────────────────────────
const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle  size={15} className="text-green-400 flex-shrink-0"  />,
  error:   <XCircle      size={15} className="text-red-400 flex-shrink-0"    />,
  warning: <AlertTriangle size={15} className="text-yellow-400 flex-shrink-0"/>,
  info:    <Info          size={15} className="text-accent flex-shrink-0"    />,
}

const BORDERS: Record<ToastVariant, string> = {
  success: 'border-green-900/60  bg-green-950/80',
  error:   'border-red-900/60    bg-red-950/80',
  warning: 'border-yellow-900/60 bg-yellow-950/80',
  info:    'border-accent/30     bg-[#111]',
}

function ToastItem({
  toast, onDismiss,
}: { toast: Toast & { _exiting?: boolean }; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 border rounded-sm shadow-2xl min-w-[280px] max-w-[400px]',
        'transition-all duration-300',
        BORDERS[toast.variant],
        visible && !(toast as any)._exiting
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2'
      )}
    >
      {ICONS[toast.variant]}
      <p className="text-sm text-white leading-snug flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#525252] hover:text-white transition-colors flex-shrink-0 mt-0.5"
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ── Toaster container ──────────────────────────────────────────
function Toaster({
  toasts, onDismiss,
}: { toasts: (Toast & { _exiting?: boolean })[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}