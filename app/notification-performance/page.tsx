'use client'
import { useEffect, useState } from 'react'
import { api, type NotificationTypePerformance } from '@/lib/api'
import { SectionHeader, Card, Table, Tr, Td, Select } from '@/components/ui'

export default function NotificationPerformancePage() {
  const [days, setDays] = useState('14')
  const [rows, setRows] = useState<NotificationTypePerformance[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    api.getNotificationPerformance(Number(days))
      .then(r => setRows(Array.isArray(r) ? r : []))
      .catch(e => setError(e.message))
  }, [days])

  const total = rows.reduce((a, r) => ({ sent: a.sent + r.sent, opened: a.opened + r.opened }), { sent: 0, opened: 0 })

  return (
    <div className="max-w-[1400px] space-y-6">
      <SectionHeader
        title="Notification performance"
        sub={`${total.sent} sent · ${total.opened} opened (${total.sent ? Math.round((total.opened / total.sent) * 100) : 0}%) in the last ${days} days`}
        action={<Select value={days} onChange={setDays} options={[{ value: '7', label: '7 days' }, { value: '14', label: '14 days' }, { value: '30', label: '30 days' }, { value: '90', label: '90 days' }]} />}
      />
      {error && <div className="text-sm text-red-400">{error}</div>}
      <Card>
        <Table headers={['Type', 'Sent', 'Opened', 'Open rate', 'Off by user', 'Quiet hours', 'Daily cap', 'No device']}>
          {rows.length === 0 ? (
            <Tr><Td colSpan={8}>No notifications in this period.</Td></Tr>
          ) : rows.map(r => (
            <Tr key={r.type}>
              <Td><span className="font-mono text-xs">{r.type}</span></Td>
              <Td>{r.sent}</Td>
              <Td>{r.opened}</Td>
              <Td>{r.openRatePct}%</Td>
              <Td>{r.suppressedPref}</Td>
              <Td>{r.suppressedQuiet}</Td>
              <Td>{r.suppressedCap}</Td>
              <Td>{r.noTokens}</Td>
            </Tr>
          ))}
        </Table>
      </Card>
      <p className="text-xs text-[#666]">
        Dose reminders are scheduled on users&apos; phones and are not counted here; this table shows server pushes only.
      </p>
    </div>
  )
}
