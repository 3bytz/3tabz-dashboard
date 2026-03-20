'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'

function SetupForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') ?? ''

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (!token) setError('Invalid or missing invite link. Please ask for a new invite.')
  }, [token])

  const valid = password.length >= 8 && password === confirm

  const handleSubmit = async () => {
    if (!valid || !token) return
    setError('')
    setLoading(true)
    try {
      await api.setupAccount(token, password)
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (e: any) {
      const msg = e?.message ?? ''
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setError('This invite link has expired or already been used. Ask for a new invite.')
      } else {
        setError(msg || 'Setup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(200,241,53,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(200,241,53,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="relative w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-9 h-9 bg-[#C8F135] rounded flex items-center justify-center">
            <Zap size={18} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">
            3TAB<span className="text-[#C8F135]">Z</span>
          </span>
          <span className="text-xs text-[#525252] border border-white/8 px-1.5 py-0.5 ml-1">ADMIN</span>
        </div>
        <div className="border border-white/8 bg-[#111] p-7">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle size={40} className="text-[#C8F135] mx-auto mb-3" />
              <h1 className="font-display font-bold text-lg text-white mb-2">Account ready!</h1>
              <p className="text-xs text-[#525252]">Redirecting you to login…</p>
            </div>
          ) : (
            <>
              <h1 className="font-display font-bold text-lg text-white mb-1">Set up your account</h1>
              <p className="text-xs text-[#525252] mb-6">Create a password to access the 3TABZ admin dashboard.</p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-[#525252]">New password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-3 py-2.5 pr-10 outline-none focus:border-white/30 transition-colors placeholder:text-[#404040]"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#525252] hover:text-white">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#525252]">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    onKeyDown={e => e.key === 'Enter' && valid && handleSubmit()}
                    className="w-full bg-[#0a0a0a] border border-white/10 text-white text-sm px-3 py-2.5 outline-none focus:border-white/30 transition-colors placeholder:text-[#404040]"
                  />
                </div>
                {password.length > 0 && confirm.length > 0 && !valid && (
                  <p className="text-xs text-red-400">
                    {password.length < 8 ? 'Password must be at least 8 characters' : 'Passwords do not match'}
                  </p>
                )}
              </div>
              {error && (
                <div className="mt-3 text-xs text-red-400 border border-red-900 bg-red-950/30 px-3 py-2">{error}</div>
              )}
              <button onClick={handleSubmit} disabled={!valid || loading || !token}
                className="w-full mt-5 bg-[#C8F135] text-black text-sm font-bold py-2.5 hover:bg-[#A8D015] transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-display tracking-wide">
                {loading ? 'Setting up…' : 'Create account →'}
              </button>
            </>
          )}
        </div>
        <p className="text-center text-xs text-[#333] mt-5">3TABZ Admin · Authorised access only</p>
      </div>
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#525252] text-sm">Loading…</div>
      </div>
    }>
      <SetupForm />
    </Suspense>
  )
}
