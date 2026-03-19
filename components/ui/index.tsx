'use client'
import { clsx } from 'clsx'

// ── Stat Card ──────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: boolean
}) {
  return (
    <div className="border border-white/8 bg-[#111] p-5 flex flex-col gap-1.5">
      <span className="text-xs text-[#a3a3a3] uppercase tracking-widest font-medium">{label}</span>
      <span className={clsx(
        'font-display font-bold text-3xl tracking-tight leading-none',
        accent ? 'text-accent' : 'text-white'
      )}>
        {value}
      </span>
      {sub && <span className="text-sm text-[#787878]">{sub}</span>}
    </div>
  )
}

// ── Badge ──────────────────────────────────────────────────────
export function Badge({ children, color = 'gray' }: {
  children: React.ReactNode
  color?: 'green' | 'red' | 'yellow' | 'gray' | 'accent'
}) {
  const styles = {
    green:  'bg-green-950  text-green-300  border-green-800',
    red:    'bg-red-950    text-red-300    border-red-800',
    yellow: 'bg-yellow-950 text-yellow-300 border-yellow-800',
    gray:   'bg-white/6    text-[#c0c0c0]  border-white/12',
    accent: 'bg-accent/10  text-accent     border-accent/25',
  }
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 text-xs font-medium border rounded-sm',
      styles[color]
    )}>
      {children}
    </span>
  )
}

// ── Table ──────────────────────────────────────────────────────
export function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8">
            {headers.map(h => (
              <th key={h} className="text-left text-xs text-[#a3a3a3] uppercase tracking-wider py-3 pr-5 font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={clsx('border-b border-white/5 hover:bg-white/3 transition-colors', className)}>
      {children}
    </tr>
  )
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={clsx('py-3.5 pr-5 text-[#e0e0e0] align-middle', className)}>
      {children}
    </td>
  )
}

// ── Section Header ─────────────────────────────────────────────
export function SectionHeader({ title, sub, action }: {
  title: string; sub?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display font-bold text-xl tracking-tight text-white">{title}</h2>
        {sub && <p className="text-sm text-[#a3a3a3] mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Card ───────────────────────────────────────────────────────
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('border border-white/8 bg-[#111] p-5', className)}>
      {children}
    </div>
  )
}

// ── Button ─────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', onClick, disabled, className, size = 'md' }: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  onClick?: () => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md'
}) {
  const variants = {
    primary:   'bg-accent text-black hover:bg-accent-dark font-semibold',
    secondary: 'border border-white/20 text-white hover:bg-white/8 hover:border-white/30',
    danger:    'bg-red-950 text-red-300 border border-red-800 hover:bg-red-900',
    ghost:     'text-[#a3a3a3] hover:text-white',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className
      )}
    >
      {children}
    </button>
  )
}

// ── Input ──────────────────────────────────────────────────────
export function Input({ placeholder, value, onChange, className, type = 'text' }: {
  placeholder?: string; value?: string; onChange?: (v: string) => void
  className?: string; type?: string
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      className={clsx(
        'bg-[#0d0d0d] border border-white/12 text-white text-sm px-3 py-2 outline-none',
        'focus:border-white/35 transition-colors placeholder:text-[#666]',
        className
      )}
    />
  )
}

// ── Select ─────────────────────────────────────────────────────
export function Select({ value, onChange, options, className }: {
  value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; className?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={clsx(
        'bg-[#0d0d0d] border border-white/12 text-white text-sm px-3 py-2 outline-none',
        'focus:border-white/35 cursor-pointer',
        className
      )}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ── Status dot ─────────────────────────────────────────────────
export function StatusDot({ status }: { status: 'operational' | 'degraded' | 'outage' }) {
  const colors = {
    operational: 'bg-green-400',
    degraded:    'bg-yellow-400',
    outage:      'bg-red-400',
  }
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-50', colors[status])} />
      <span className={clsx('relative inline-flex rounded-full h-2.5 w-2.5', colors[status])} />
    </span>
  )
}

// ── Textarea ───────────────────────────────────────────────────
export function Textarea({ placeholder, value, onChange, rows = 3, className, maxLength }: {
  placeholder?: string; value?: string; onChange?: (v: string) => void
  rows?: number; className?: string; maxLength?: number
}) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      rows={rows}
      maxLength={maxLength}
      className={clsx(
        'w-full bg-[#0d0d0d] border border-white/12 text-white text-sm px-3 py-2',
        'outline-none focus:border-white/35 transition-colors placeholder:text-[#666] resize-none',
        className
      )}
    />
  )
}