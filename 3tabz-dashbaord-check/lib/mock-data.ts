// lib/mock-data.ts
// All mock data for the dashboard. Replace with real API calls when backend is live.
// Toggle NEXT_PUBLIC_USE_MOCK=false in .env.local to switch to live data.

export const overviewStats = {
  totalUsers: 4821,
  activeUsers7d: 1243,
  activeUsers30d: 2890,
  newSignupsToday: 34,
  newSignupsWeek: 218,
  totalSubscriptions: 986,
  conversionRate: 20.4,
  totalMedications: 18432,
  totalDosesLogged: 247891,
  churnRate30d: 2.1,
  mrr: 2948.14,
  arr: 35377.68,
}

export const signupsByDay = [
  { date: 'Feb 3', signups: 18 }, { date: 'Feb 4', signups: 24 },
  { date: 'Feb 5', signups: 31 }, { date: 'Feb 6', signups: 27 },
  { date: 'Feb 7', signups: 19 }, { date: 'Feb 8', signups: 12 },
  { date: 'Feb 9', signups: 15 }, { date: 'Feb 10', signups: 22 },
  { date: 'Feb 11', signups: 29 }, { date: 'Feb 12', signups: 35 },
  { date: 'Feb 13', signups: 41 }, { date: 'Feb 14', signups: 38 },
  { date: 'Feb 15', signups: 33 }, { date: 'Feb 16', signups: 21 },
  { date: 'Feb 17', signups: 18 }, { date: 'Feb 18', signups: 26 },
  { date: 'Feb 19', signups: 30 }, { date: 'Feb 20', signups: 44 },
  { date: 'Feb 21', signups: 51 }, { date: 'Feb 22', signups: 47 },
  { date: 'Feb 23', signups: 39 }, { date: 'Feb 24', signups: 28 },
  { date: 'Feb 25', signups: 22 }, { date: 'Feb 26', signups: 31 },
  { date: 'Feb 27', signups: 36 }, { date: 'Feb 28', signups: 29 },
  { date: 'Mar 1', signups: 34 },  { date: 'Mar 2', signups: 40 },
  { date: 'Mar 3', signups: 38 },  { date: 'Mar 4', signups: 34 },
]

export const activeUsersTrend = [
  { month: 'Oct', users: 410 }, { month: 'Nov', users: 680 },
  { month: 'Dec', users: 920 }, { month: 'Jan', users: 1380 },
  { month: 'Feb', users: 1890 }, { month: 'Mar', users: 2890 },
]

export const revenueByMonth = [
  { month: 'Oct', mrr: 0 }, { month: 'Nov', mrr: 214 },
  { month: 'Dec', mrr: 589 }, { month: 'Jan', mrr: 1120 },
  { month: 'Feb', mrr: 2048 }, { month: 'Mar', mrr: 2948 },
]

export const users = [
  { id: 'u1', name: 'Adaeze Okonkwo', email: 'adaeze@example.com', plan: 'pro', collections: 3, medications: 12, joined: '2024-11-02', lastActive: '2025-03-04', status: 'active', country: 'NG', platform: 'ios' },
  { id: 'u2', name: 'Marcus Thompson', email: 'marcus.t@example.com', plan: 'pro', collections: 2, medications: 8, joined: '2024-12-14', lastActive: '2025-03-03', status: 'active', country: 'GB', platform: 'android' },
  { id: 'u3', name: 'Priya Krishnamurthy', email: 'priya.k@example.com', plan: 'free', collections: 1, medications: 4, joined: '2025-01-08', lastActive: '2025-03-02', status: 'active', country: 'IN', platform: 'ios' },
  { id: 'u4', name: 'James Osei', email: 'james.o@example.com', plan: 'pro', collections: 4, medications: 19, joined: '2024-10-29', lastActive: '2025-03-04', status: 'active', country: 'GH', platform: 'android' },
  { id: 'u5', name: 'Sarah Mensah', email: 'sarah.m@example.com', plan: 'free', collections: 2, medications: 6, joined: '2025-02-01', lastActive: '2025-02-28', status: 'active', country: 'GH', platform: 'ios' },
  { id: 'u6', name: 'David Nwosu', email: 'd.nwosu@example.com', plan: 'pro', collections: 1, medications: 3, joined: '2024-12-20', lastActive: '2025-03-01', status: 'active', country: 'NG', platform: 'ios' },
  { id: 'u7', name: 'Emma Clarke', email: 'emma.c@example.com', plan: 'free', collections: 1, medications: 2, joined: '2025-02-15', lastActive: '2025-02-20', status: 'inactive', country: 'AU', platform: 'ios' },
  { id: 'u8', name: 'Kofi Asante', email: 'kofi.a@example.com', plan: 'pro', collections: 3, medications: 11, joined: '2024-11-18', lastActive: '2025-03-04', status: 'active', country: 'GH', platform: 'android' },
  { id: 'u9', name: 'Fatima Al-Hassan', email: 'fatima.h@example.com', plan: 'free', collections: 2, medications: 7, joined: '2025-01-22', lastActive: '2025-02-25', status: 'active', country: 'NG', platform: 'android' },
  { id: 'u10', name: 'Liam O\'Brien', email: 'liam.ob@example.com', plan: 'pro', collections: 2, medications: 5, joined: '2025-01-05', lastActive: '2025-03-03', status: 'active', country: 'IE', platform: 'ios' },
  { id: 'u11', name: 'Amara Diallo', email: 'amara.d@example.com', plan: 'free', collections: 1, medications: 3, joined: '2025-02-28', lastActive: '2025-03-01', status: 'active', country: 'SN', platform: 'android' },
  { id: 'u12', name: 'Test Spammer', email: 'spam99@mailinator.com', plan: 'free', collections: 0, medications: 0, joined: '2025-03-03', lastActive: '2025-03-03', status: 'banned', country: 'XX', platform: 'android' },
]

export const subscriptions = [
  { id: 's1', userId: 'u1', userName: 'Adaeze Okonkwo', email: 'adaeze@example.com', platform: 'apple', status: 'active', productId: 'com.3tabz.pro.monthly', started: '2024-11-02', expires: '2025-04-02', revenue: 8.97, autoRenew: true },
  { id: 's2', userId: 'u2', userName: 'Marcus Thompson', email: 'marcus.t@example.com', platform: 'google', status: 'active', productId: 'com.3tabz.pro.monthly', started: '2024-12-14', expires: '2025-04-14', revenue: 8.97, autoRenew: true },
  { id: 's3', userId: 'u4', userName: 'James Osei', email: 'james.o@example.com', platform: 'google', status: 'active', productId: 'com.3tabz.pro.monthly', started: '2024-10-29', expires: '2025-04-29', revenue: 14.95, autoRenew: true },
  { id: 's4', userId: 'u6', userName: 'David Nwosu', email: 'd.nwosu@example.com', platform: 'apple', status: 'active', productId: 'com.3tabz.pro.monthly', started: '2024-12-20', expires: '2025-04-20', revenue: 8.97, autoRenew: false },
  { id: 's5', userId: 'u8', userName: 'Kofi Asante', email: 'kofi.a@example.com', platform: 'google', status: 'active', productId: 'com.3tabz.pro.monthly', started: '2024-11-18', expires: '2025-04-18', revenue: 11.96, autoRenew: true },
  { id: 's6', userId: 'u10', userName: 'Liam O\'Brien', email: 'liam.ob@example.com', platform: 'apple', status: 'active', productId: 'com.3tabz.pro.monthly', started: '2025-01-05', expires: '2025-04-05', revenue: 8.97, autoRenew: true },
  { id: 's7', userId: 'ux1', userName: 'Grace Eze', email: 'grace.e@example.com', platform: 'apple', status: 'cancelled', productId: 'com.3tabz.pro.monthly', started: '2024-09-01', expires: '2025-03-01', revenue: 17.94, autoRenew: false },
  { id: 's8', userId: 'ux2', userName: 'Tunde Bello', email: 'tunde.b@example.com', platform: 'google', status: 'expired', productId: 'com.3tabz.pro.monthly', started: '2024-08-15', expires: '2025-02-15', revenue: 14.95, autoRenew: false },
]

export const broadcasts = [
  { id: 'b1', title: 'Happy New Year from 3TABZ! 🎉', body: 'Wishing you a healthy and organised 2025. Track your first dose of the new year!', type: 'holiday', target: 'all', sentAt: '2025-01-01T08:00:00Z', recipients: 2840, delivered: 2791, opened: 1203, ctr: 43.1 },
  { id: 'b2', title: 'New feature: Temperature Logging', body: 'You can now log your body temperature before and after taking medications. Try it now!', type: 'feature', target: 'all', sentAt: '2025-02-10T10:00:00Z', recipients: 3920, delivered: 3841, opened: 1892, ctr: 49.3 },
  { id: 'b3', title: 'Your weekly adherence report is ready', body: 'See how well you did this week. Pro users get the full breakdown.', type: 'general', target: 'pro', sentAt: '2025-03-03T09:00:00Z', recipients: 986, delivered: 971, opened: 612, ctr: 63.0 },
]

export const aiUsageStats = {
  totalRequests: 28491,
  requestsToday: 412,
  requestsThisMonth: 8921,
  estimatedCostMonth: 142.74,
  estimatedCostTotal: 341.89,
  errorRate: 1.2,
  avgResponseMs: 1840,
  topEndpoints: [
    { endpoint: '/ai-suggestions/generate', calls: 12841, costUsd: 154.09 },
    { endpoint: '/ai-suggestions/medication-guide', calls: 8201, costUsd: 98.41 },
    { endpoint: '/ai-suggestions/adherence-analysis', calls: 4291, costUsd: 51.49 },
    { endpoint: '/ai-suggestions/interaction-check', calls: 2108, costUsd: 25.30 },
    { endpoint: '/ai-suggestions/recovery', calls: 1050, costUsd: 12.60 },
  ],
  topMedications: ['Amoxicillin', 'Paracetamol', 'Metformin', 'Lisinopril', 'Vitamin D3', 'Ibuprofen', 'Omeprazole'],
  dailyRequests: [
    { date: 'Feb 26', requests: 201 }, { date: 'Feb 27', requests: 289 },
    { date: 'Feb 28', requests: 310 }, { date: 'Mar 1', requests: 298 },
    { date: 'Mar 2', requests: 344 }, { date: 'Mar 3', requests: 401 },
    { date: 'Mar 4', requests: 412 },
  ],
}

export const appHealth = {
  apiStatus: 'operational' as const,
  dbStatus: 'operational' as const,
  redisStatus: 'operational' as const,
  pushStatus: 'operational' as const,
  p50ResponseMs: 84,
  p95ResponseMs: 312,
  p99ResponseMs: 891,
  errorRatePct: 0.4,
  activePushTokens: 3241,
  iosTokens: 1892,
  androidTokens: 1349,
  failedPushes24h: 23,
  cronJobs: [
    { name: 'daily-ai-guidance', schedule: '0 8 * * *', lastRun: '2025-03-04T08:00:12Z', status: 'success', durationMs: 4821 },
    { name: 'occurrence-alerts', schedule: '0 7 * * *', lastRun: '2025-03-04T07:00:08Z', status: 'success', durationMs: 1203 },
    { name: 'low-stock-check', schedule: '0 */4 * * *', lastRun: '2025-03-04T12:00:05Z', status: 'success', durationMs: 892 },
    { name: 'adherence-summary', schedule: '0 0 * * *', lastRun: '2025-03-04T00:00:09Z', status: 'success', durationMs: 2341 },
    { name: 'illness-history-sync', schedule: '0 2 * * *', lastRun: '2025-03-04T02:00:14Z', status: 'success', durationMs: 3102 },
    { name: 'subscription-check', schedule: '0 3 * * 0', lastRun: '2025-03-02T03:00:07Z', status: 'success', durationMs: 441 },
    { name: 'dead-token-cleanup', schedule: '0 4 * * *', lastRun: '2025-03-04T04:00:06Z', status: 'success', durationMs: 310 },
    { name: 'scheduled-broadcasts', schedule: '0 * * * *', lastRun: '2025-03-04T13:00:03Z', status: 'success', durationMs: 88 },
  ],
  responseTimeSeries: [
    { time: '08:00', p50: 78, p95: 290 }, { time: '09:00', p50: 82, p95: 301 },
    { time: '10:00', p50: 91, p95: 344 }, { time: '11:00', p50: 88, p95: 318 },
    { time: '12:00', p50: 102, p95: 401 }, { time: '13:00', p50: 84, p95: 312 },
  ],
  versionDistribution: [
    { version: '1.0.0', count: 1240, pct: 38.3 },
    { version: '0.9.8', count: 891, pct: 27.5 },
    { version: '0.9.7', count: 612, pct: 18.9 },
    { version: '0.9.5', count: 498, pct: 15.3 },
  ],
}

export const notifTemplates = [
  { id: 't1', name: 'Weekly Reminder', title: 'How\'s your health this week?', body: 'Check your adherence score and see your progress. Keep it up!', type: 'general' },
  { id: 't2', name: 'Christmas', title: 'Merry Christmas from 3TABZ 🎄', body: 'Wishing you a healthy and joyful holiday season. Don\'t forget your medications!', type: 'holiday' },
  { id: 't3', name: 'New Year', title: 'Happy New Year! 🎉', body: 'New year, healthier you. Track your first dose of the year with 3TABZ.', type: 'holiday' },
]

// ── Content / Support mock data ────────────────────────────────
export const flaggedSuggestions = [
  { id: 'f1', userId: 'u3', userName: 'Priya Krishnamurthy', suggestionText: 'Consider increasing your Metformin dose if blood sugar remains high.', category: 'warning', flaggedAt: '2025-03-03T14:22:00Z', reason: 'Suggests changing prescription dosage', status: 'pending' },
  { id: 'f2', userId: 'u7', userName: 'Emma Clarke', suggestionText: 'Stop taking Amoxicillin if you feel better after 3 days.', category: 'warning', flaggedAt: '2025-03-02T09:41:00Z', reason: 'Advises stopping antibiotics early', status: 'pending' },
  { id: 'f3', userId: 'u9', userName: 'Fatima Al-Hassan', suggestionText: 'You can take ibuprofen and paracetamol together every 2 hours.', category: 'general', flaggedAt: '2025-03-01T17:05:00Z', reason: 'Incorrect dosing interval advice', status: 'reviewed' },
]

export const dataExportRequests = [
  { id: 'e1', userId: 'u2', userName: 'Marcus Thompson', email: 'marcus.t@example.com', requestedAt: '2025-03-04T08:12:00Z', status: 'pending', notes: '' },
  { id: 'e2', userId: 'u5', userName: 'Sarah Mensah', email: 'sarah.m@example.com', requestedAt: '2025-03-03T11:30:00Z', status: 'dispatched', notes: 'Sent via email 2025-03-03' },
  { id: 'e3', userId: 'u11', userName: 'Amara Diallo', email: 'amara.d@example.com', requestedAt: '2025-03-01T16:44:00Z', status: 'dispatched', notes: 'Sent via email 2025-03-02' },
]

export const deletionRequests = [
  { id: 'd1', userId: 'u7', userName: 'Emma Clarke', email: 'emma.c@example.com', requestedAt: '2025-02-25T10:00:00Z', deletionDue: '2025-03-27T10:00:00Z', status: 'pending', daysLeft: 23 },
  { id: 'd2', userId: 'ux3', userName: 'Old Test Account', email: 'test123@mailinator.com', requestedAt: '2025-02-01T00:00:00Z', deletionDue: '2025-03-03T00:00:00Z', status: 'overdue', daysLeft: -1 },
]

// ── Error by endpoint (health page) ───────────────────────────
export const errorsByEndpoint = [
  { endpoint: 'POST /auth/login',              requests: 8421, errors: 312, errorPct: 3.7 },
  { endpoint: 'POST /ai-suggestions/generate', requests: 4201, errors: 88,  errorPct: 2.1 },
  { endpoint: 'PATCH /medications/:id',        requests: 2901, errors: 24,  errorPct: 0.8 },
  { endpoint: 'POST /medication-logs/taken',   requests: 12440, errors: 41, errorPct: 0.3 },
  { endpoint: 'GET /collections/active',       requests: 19201, errors: 38, errorPct: 0.2 },
]
