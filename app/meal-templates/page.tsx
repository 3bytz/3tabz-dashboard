'use client'
import { useEffect, useMemo, useState } from 'react'
import { api, type MealTemplate } from '@/lib/api'
import { SectionHeader, Card, Table, Tr, Td, Badge, Button, Textarea } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

const SLOTS = ['breakfast', 'snack', 'lunch', 'dinner', 'late_snack']
const ALLERGENS = ['groundnut', 'egg', 'fish', 'shellfish', 'dairy', 'gluten', 'soy', 'sesame']
const EXAMPLE: MealTemplate[] = [{
  id: 'moimoi_pap', name: 'Moi-moi with pap (ogi)', slots: ['breakfast'], energy: 'medium',
  costNaira: [700, 1200], tags: ['protein', 'south_west'], allergens: [], ingredients: ['beans', 'pepper', 'onion', 'pap'],
  regions: ['south_west'], diet: ['vegetarian', 'halal_ok'], note: 'Choose unsweetened pap for blood-sugar goals.',
}]

function validate(items: unknown): string | null {
  if (!Array.isArray(items)) return 'Must be a JSON array'
  if (items.length > 500) return 'Maximum 500 templates'
  const ids = new Set<string>()
  for (let i = 0; i < items.length; i++) {
    const t = items[i]
    const at = `Item ${i + 1}`
    if (!t || typeof t !== 'object') return `${at}: not an object`
    const m = t as MealTemplate
    if (!/^[a-z0-9_]{2,40}$/.test(m.id ?? '')) return `${at}: id must be 2–40 chars a-z, 0-9, _`
    if (ids.has(m.id)) return `${at}: duplicate id ${m.id}`
    ids.add(m.id)
    if (!m.name || m.name.length > 120) return `${at}: name required (≤120 chars)`
    if (!Array.isArray(m.slots) || !m.slots.length || m.slots.some(s => !SLOTS.includes(s))) return `${at}: slots must be from ${SLOTS.join(', ')}`
    if (!['light', 'medium', 'hearty'].includes(m.energy)) return `${at}: energy must be light/medium/hearty`
    if (!Array.isArray(m.costNaira) || m.costNaira.length !== 2 || m.costNaira.some(n => !Number.isInteger(n) || n < 0 || n > 100000) || m.costNaira[0] > m.costNaira[1]) return `${at}: costNaira must be [min, max] whole naira`
    if (!Array.isArray(m.allergens) || m.allergens.some(a => !ALLERGENS.includes(a))) return `${at}: allergens must be from ${ALLERGENS.join(', ')}`
    if (!Array.isArray(m.ingredients) || !m.ingredients.length) return `${at}: list the ingredients (used for allergy and "avoid" filtering)`
    if (!Array.isArray(m.tags)) return `${at}: tags must be an array`
  }
  return null
}

export default function MealTemplatesPage() {
  const { success, error: toastError } = useToast()
  const [text, setText] = useState('')
  const [builtIn, setBuiltIn] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getMealTemplates()
      .then(r => {
        const items = Array.isArray(r) ? r : r.items
        setBuiltIn(!Array.isArray(r) && r.usingBuiltIn)
        setText(JSON.stringify(items.length ? items : EXAMPLE, null, 2))
      })
      .catch(e => toastError(e.message))
  }, [])

  const parsed = useMemo(() => {
    try { return { items: JSON.parse(text) as MealTemplate[], err: null as string | null } }
    catch (e: any) { return { items: [] as MealTemplate[], err: `Invalid JSON: ${e.message}` } }
  }, [text])
  const problem = parsed.err ?? validate(parsed.items)

  const save = async () => {
    if (problem) return
    setSaving(true)
    try {
      const r = await api.updateMealTemplates(parsed.items)
      success(`Saved ${r.count} meal templates. New plans use them immediately.`)
      setBuiltIn(false)
    } catch (e: any) {
      toastError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[1400px] space-y-6">
      <SectionHeader
        title="Meal templates"
        sub={builtIn ? 'Planner is using the built-in Nigerian food list. Saving here replaces it.' : 'Custom templates are live in the meal planner.'}
        action={<Button onClick={save} disabled={!!problem || saving}>{saving ? 'Saving…' : 'Save templates'}</Button>}
      />
      <Card className="p-4 space-y-2">
        <p className="text-xs text-[#888]">
          Templates are general healthy-eating options only — never therapeutic diets. Costs are rough ranges per portion in naira.
          Allergens and ingredients drive the planner&apos;s allergy and &quot;foods to avoid&quot; filters, so be complete.
        </p>
        <Textarea value={text} onChange={setText} rows={22} className="font-mono text-xs" />
        {problem ? <div className="text-xs text-red-400">{problem}</div> : <div className="text-xs text-green-400">Looks valid · {parsed.items.length} templates</div>}
      </Card>
      {!problem && (
        <Card>
          <Table headers={['ID', 'Name', 'Slots', 'Energy', '₦ range', 'Allergens']}>
            {parsed.items.slice(0, 100).map(t => (
              <Tr key={t.id}>
                <Td><span className="font-mono text-xs">{t.id}</span></Td>
                <Td>{t.name}</Td>
                <Td>{t.slots.join(', ')}</Td>
                <Td>{t.energy}</Td>
                <Td>₦{t.costNaira[0].toLocaleString()}–₦{t.costNaira[1].toLocaleString()}</Td>
                <Td>{t.allergens.length ? t.allergens.map(a => <Badge key={a} color="yellow">{a}</Badge>) : '—'}</Td>
              </Tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  )
}
