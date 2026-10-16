// All calls go to this app's own /api/* route handlers (BFF). The admin session lives
// in an HttpOnly cookie that JavaScript cannot read; the BFF adds it server-side.
const BASE = '/api'

function getCsrf(): string {
  if (typeof document === 'undefined') return ''
  const m = document.cookie.match(/(?:^|;\s*)(?:__Host-)?3tabz_csrf=([^;]*)/)
  return m ? decodeURIComponent(m[1]) : ''
}

// ── Error type ──────────────────────────────────────────────────
export interface ApiError extends Error { status: number; code?: string }

// ── Response types ──────────────────────────────────────────────
export interface OverviewStats {
  totalUsers: number; activeUsers7d: number; activeUsers30d: number
  newSignupsToday: number; newSignupsWeek: number; totalSubscriptions: number
  conversionRate: number; totalMedications: number; totalDosesLogged: number
  churnRate30d: number; mrr: number; arr: number
}
export interface SignupDay    { date: string; signups: number }
export interface ActiveMonth  { month: string; users: number }
export interface RevenueMonth { month: string; mrr: number }

export interface User {
  id: string; name: string; email: string; plan: 'free' | 'pro'
  collections: number; medications: number; joined: string
  lastActive: string; status: 'active' | 'inactive' | 'banned'
  country: string; platform: 'ios' | 'android'
  pushToken?: string; pushTokenStatus?: string
}
export interface UserActivity { action: string; at: string }

export interface Subscription {
  id: string; userId: string; userName: string; email: string
  platform: 'apple' | 'google' | 'admin'; status: 'active' | 'cancelled' | 'expired' | 'trial'
  productId: string; started: string; expires: string; revenue: number; autoRenew: boolean
}

export interface Broadcast {
  id: string; title: string; body: string; type: string; target: string
  sentAt: string; scheduledAt?: string; recipients: number
  delivered: number; opened: number; ctr: number
}

export interface AIUsageStats {
  totalRequests: number; requestsToday: number; requestsThisMonth: number
  estimatedCostMonth: number; estimatedCostTotal: number
  errorRate: number; avgResponseMs: number
  topEndpoints: { endpoint: string; calls: number; costUsd: number }[]
  topMedications: string[]
  dailyRequests: { date: string; requests: number }[]
}

export type ServiceStatus = 'operational' | 'degraded' | 'outage'
export interface AppHealth {
  apiStatus: ServiceStatus; dbStatus: ServiceStatus
  redisStatus: ServiceStatus; pushStatus: ServiceStatus
  p50ResponseMs: number; p95ResponseMs: number; p99ResponseMs: number
  errorRatePct: number; activePushTokens: number
  iosTokens: number; androidTokens: number; failedPushes24h: number
  cronJobs: { name: string; schedule: string; lastRun: string; status: 'success' | 'failed' | 'running'; durationMs: number }[]
  responseTimeSeries: { time: string; p50: number; p95: number }[]
  versionDistribution: { version: string; count: number; pct: number }[]
}

export interface ErrorByEndpoint { endpoint: string; requests: number; errors: number; errorPct: number }

export interface FlaggedSuggestion {
  id: string; userId: string; userName: string; suggestionText: string
  category: string; flaggedAt: string; reason: string
  status: 'pending' | 'reviewed' | 'dismissed'
}

export interface DataExportRequest {
  id: string; userId: string; userName: string; email: string
  requestedAt: string; status: 'pending' | 'dispatched'; notes: string
}

export interface DeletionRequest {
  id: string; userId: string; userName: string; email: string
  requestedAt: string; deletionDue: string
  status: 'pending' | 'overdue' | 'completed'; daysLeft: number
}

export interface AdminUser {
  id: string; name: string; email: string
  role: 'super_admin' | 'admin' | 'support'; you?: boolean
}

export interface AppSettings {
  flags: {
    maintenanceMode: boolean; aiEnabled: boolean; occurrenceAlerts: boolean
    newRegistrations: boolean; proUpgrades: boolean; dataExports: boolean
  }
  broadcastLimits: { maxPerDay: number; batchSize: number; batchDelayMs: number; undoSecs: number }
  ipAllowlist: { enabled: boolean; ips: string[] }
  cronJobs: { id: string; name: string; schedule: string; enabled: boolean }[]
}

export interface AuditEntry {
  id: string; at: string; admin: string; role: string; method: string; route: string
  targetId?: string | null; action: string; status: number; ip?: string | null; fields?: string[]
}
export interface NotificationTypePerformance {
  type: string; sent: number; opened: number; openRatePct: number
  suppressedPref: number; suppressedQuiet: number; suppressedCap: number; noTokens: number
}
export interface MealTemplate {
  id: string; name: string; slots: string[]; energy: 'light' | 'medium' | 'hearty'
  costNaira: number[]; tags: string[]; allergens: string[]; ingredients: string[]
  regions?: string[]; diet?: string[]; note?: string
}

// ── Core fetch helper ───────────────────────────────────────────
async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const method = (options?.method ?? 'GET').toUpperCase()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  }
  if (method !== 'GET') headers['X-CSRF-Token'] = getCsrf()

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers,
  })

  if (res.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login'
    }
    const err = new Error('Session expired — please sign in again') as ApiError
    err.status = 401
    throw err
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg = Array.isArray(body?.message) ? body.message.join('. ') : body?.message
    const err  = new Error(msg ?? body?.error ?? `API error ${res.status}`) as ApiError
    err.status = res.status
    err.code   = body?.code
    throw err
  }

  if (res.status === 204) return undefined as unknown as T
  const json = await res.json()
  return (json?.data ?? json) as T
}

// ── API surface ─────────────────────────────────────────────────
export const api = {

  // ── Auth (BFF /api/session/*) ─────────────────────────────────
  login: (email: string, password: string) =>
    req<{ totpRequired: boolean; totpSetupRequired: boolean; signedIn: boolean }>('/session/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  verifyTotp: (code: string) =>
    req<{ signedIn: boolean }>('/session/totp', { method: 'POST', body: JSON.stringify({ code }) }),
  startTotpSetup: () =>
    req<{ secret: string; qr: string }>('/session/totp-setup', { method: 'POST' }),
  enableTotp: (code: string) =>
    req<{ signedIn: boolean }>('/session/totp-enable', { method: 'POST', body: JSON.stringify({ code }) }),
  adminLogout: () => req('/session/logout', { method: 'POST' }),
  me: () => req<{ id: string; email: string; role: AdminUser['role']; name: string }>('/session/me'),
  setupAccount: (inviteToken: string, password: string) =>
    req('/session/setup-account', { method: 'POST', body: JSON.stringify({ inviteToken, password }) }),

  // ── Overview ──────────────────────────────────────────────────
  getOverviewStats:    () => req<OverviewStats>('/admin/stats/overview'),
  getSignupsByDay:     () => req<SignupDay[]>('/admin/stats/signups-by-day'),
  getActiveUsersTrend: () => req<ActiveMonth[]>('/admin/stats/active-users-trend'),
  getRevenueByMonth:   () => req<RevenueMonth[]>('/admin/stats/revenue-by-month'),

  // ── Users ────────────────────────────────────────────────────
  getUsers: (params?: { plan?: string; status?: string; search?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => Boolean(v)))
    ).toString()
    return req<User[]>(`/admin/users${qs ? `?${qs}` : ''}`)
  },
  getUserById:          (id: string)                      => req<User>(`/admin/users/${id}`),
  getUserActivity:      (id: string)                      => req<UserActivity[]>(`/admin/users/${id}/activity`),
  getUserSubscriptions: (id: string)                      => req<Subscription[]>(`/admin/users/${id}/subscriptions`),
  updateUser:           (id: string, body: Partial<User>) => req<User>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  banUser:              (id: string)                      => req<void>(`/admin/users/${id}/ban`,            { method: 'POST' }),
  unbanUser:            (id: string)                      => req<void>(`/admin/users/${id}/unban`,          { method: 'POST' }),
  deleteUser:           (id: string)                      => req<void>(`/admin/users/${id}`,                { method: 'DELETE' }),
  grantPro:             (id: string)                      => req<void>(`/admin/users/${id}/grant-pro`,      { method: 'POST' }),
  resetPassword:        (id: string)                      => req<void>(`/admin/users/${id}/reset-password`, { method: 'POST' }),

  // ── Subscriptions ─────────────────────────────────────────────
  getSubscriptions: (params?: { status?: string; platform?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => Boolean(v)))
    ).toString()
    return req<Subscription[]>(`/admin/subscriptions${qs ? `?${qs}` : ''}`)
  },
  revokeSubscription: (id: string) =>
    req<void>(`/admin/subscriptions/${id}/revoke`, { method: 'POST' }),
  grantSubscription: (userId: string, days = 30) =>
    req<Subscription>('/admin/subscriptions/grant', { method: 'POST', body: JSON.stringify({ userId, days }) }),

  // ── Broadcasts ────────────────────────────────────────────────
  getBroadcasts: () => req<Broadcast[]>('/admin/notifications/broadcasts'),
  sendBroadcast: (payload: { title: string; body: string; target: string; type: string; deepLink?: string; scheduledAt?: string }) =>
    req<Broadcast>('/admin/notifications/broadcast', {
      method: 'POST',
      // dashboard uses 'target', backend expects 'targetAudience'
      body: JSON.stringify({ ...payload, targetAudience: payload.target }),
    }),
  cancelBroadcast: (id: string) =>
    req<void>(`/admin/notifications/broadcasts/${id}/cancel`, { method: 'POST' }),

  // ── AI Usage ─────────────────────────────────────────────────
  getAIUsageStats: () => req<AIUsageStats>('/admin/ai/usage'),

  // ── App Health ────────────────────────────────────────────────
  getAppHealth:        () => req<AppHealth>('/admin/health'),
  getErrorsByEndpoint: () => req<ErrorByEndpoint[]>('/admin/health/errors-by-endpoint'),

  // ── Content ──────────────────────────────────────────────────
  getFlaggedSuggestions: () =>
    req<FlaggedSuggestion[]>('/admin/content/flagged-suggestions'),
  updateFlaggedSuggestion: (id: string, status: 'reviewed' | 'dismissed') =>
    req<FlaggedSuggestion>(`/admin/content/flagged-suggestions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getDataExportRequests: () =>
    req<DataExportRequest[]>('/admin/content/data-exports'),
  markExportDispatched: (id: string) =>
    req<DataExportRequest>(`/admin/content/data-exports/${id}/dispatch`, { method: 'POST' }),
  getDeletionRequests: () =>
    req<DeletionRequest[]>('/admin/content/deletion-requests'),
  executeDeletion: (id: string) =>
    req<void>(`/admin/content/deletion-requests/${id}/execute`, { method: 'POST' }),

  // ── Settings ─────────────────────────────────────────────────
  getSettings:           () => req<AppSettings>('/admin/settings'),
  updateFeatureFlags:    (flags: AppSettings['flags'])            => req<void>('/admin/settings/flags',            { method: 'PATCH', body: JSON.stringify(flags)  }),
  updateBroadcastLimits: (limits: AppSettings['broadcastLimits']) => req<void>('/admin/settings/broadcast-limits', { method: 'PATCH', body: JSON.stringify(limits) }),
  updateIpAllowlist:     (allowlist: AppSettings['ipAllowlist'])  => req<void>('/admin/settings/ip-allowlist',     { method: 'PATCH', body: JSON.stringify(allowlist) }),
  // API expects { jobs: [...] } (validated DTO); sending a bare array was rejected.
  updateCronSchedules:   (jobs: AppSettings['cronJobs'])          => req<void>('/admin/settings/cron-schedules',   { method: 'PATCH', body: JSON.stringify({ jobs }) }),

  // /admin/settings/admins — matches new backend paths
  getAdmins:   () => req<AdminUser[]>('/admin/settings/admins'),
  inviteAdmin: (email: string, fullName: string, role: string) =>
    req<AdminUser>('/admin/settings/admins/invite', { method: 'POST', body: JSON.stringify({ email, fullName, role }) }),
  revokeAdmin: (id: string) =>
    req<void>(`/admin/settings/admins/${id}`, { method: 'DELETE' }),
  // ── Referral stats ────────────────────────────────────────────
  getReferralStats: (): Promise<{
    totalReferrals: number; completedReferrals: number;
    rewardedReferrals: number; pendingReferrals: number; conversionRate: number;
  }> => req('/admin/stats/referrals'),

  getRecentReferrals: (limit = 50): Promise<any[]> =>
    req(`/admin/referrals/recent?limit=${limit}`),

  // ── Audit log (super_admin) ───────────────────────────────────
  getAuditLog: (page = 1, limit = 50) =>
    req<AuditEntry[]>(`/admin/audit-log?page=${page}&limit=${limit}`),

  // ── Notification performance ──────────────────────────────────
  getNotificationPerformance: (days = 14) =>
    req<NotificationTypePerformance[]>(`/admin/notifications/performance?days=${days}`),

  // ── CMS: nutrition meal templates ─────────────────────────────
  getMealTemplates: () => req<{ items: MealTemplate[]; usingBuiltIn: boolean }>('/admin/content/meal-templates'),
  updateMealTemplates: (items: MealTemplate[]) =>
    req<{ updated: boolean; count: number }>('/admin/content/meal-templates', { method: 'PATCH', body: JSON.stringify({ items }) }),

}