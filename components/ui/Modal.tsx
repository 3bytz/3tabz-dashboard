'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/ui'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={clsx(
        'relative w-full bg-[#111] border border-white/10 shadow-2xl',
        widths[size]
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <h3 className="font-display font-bold text-white text-base">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#525252] hover:text-white transition-colors p-0.5"
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-4">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-white/8 bg-[#0d0d0d]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Confirm Modal convenience wrapper ──────────────────────────
interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

export function ConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', danger = false
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={() => { onConfirm(); onClose() }}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[#a3a3a3] leading-relaxed">{message}</p>
    </Modal>
  )
}
