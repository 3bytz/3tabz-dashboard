'use client'
import { useEffect, useState } from 'react'
import { api, type AuditEntry } from '@/lib/api'
import { SectionHeader, Card, Table, Tr, Td, Badge, Button } from '@/components/ui'

/** Read-only, append-only log of every admin action (super_admin only). */
export default function AuditLogPage() {
  const [rows, setRows] = useState<AuditEntry[]>([])
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError('')
    api.getAuditLog(page, 50)
      .then(r => setRows(Array.isArray(r) ? r : []))
      .catch(e => setError(e.status === 403 ? 'Only super admins can view the audit log.' : e.message))
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="max-w-[1400px] space-y-6">
      <SectionHeader title="Audit log" sub="Every admin action, newest first. Entries cannot be edited or deleted from the dashboard." />
      {error && <div className="text-sm text-red-400">{error}</div>}
      <Card>
        <Table headers={['When', 'Admin', 'Action', 'Route', 'Target', 'Result', 'IP']}>
          {loading ? (
            <Tr><Td colSpan={7}>Loading…</Td></Tr>
          ) : rows.length === 0 ? (
            <Tr><Td colSpan={7}>No entries.</Td></Tr>
          ) : rows.map(r => (
            <Tr key={r.id}>
              <Td>{new Date(r.at).toLocaleString('en-GB')}</Td>
              <Td>{r.admin} <span className="text-[#555]">({r.role})</span></Td>
              <Td>{r.action}</Td>
              <Td><span className="font-mono text-xs">{r.method} {r.route}</span></Td>
              <Td><span className="font-mono text-xs">{r.targetId ?? '—'}</span>{r.fields?.length ? <div className="text-[10px] text-[#666]">{r.fields.join(', ')}</div> : null}</Td>
              <Td><Badge color={r.status < 400 ? 'green' : 'red'}>{r.status}</Badge></Td>
              <Td><span className="font-mono text-xs">{r.ip ?? '—'}</span></Td>
            </Tr>
          ))}
        </Table>
      </Card>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Newer</Button>
        <Button variant="secondary" disabled={rows.length < 50} onClick={() => setPage(p => p + 1)}>Older →</Button>
      </div>
    </div>
  )
}
