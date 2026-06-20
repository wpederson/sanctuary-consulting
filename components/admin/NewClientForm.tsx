'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Props { consultants: any[] }

export default function NewClientForm({ consultants }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const form = e.currentTarget
    const data = {
      church:        (form.elements.namedItem('church') as HTMLInputElement).value.trim(),
      contact:       (form.elements.namedItem('contact') as HTMLInputElement).value.trim(),
      email:         (form.elements.namedItem('email') as HTMLInputElement).value.trim().toLowerCase(),
      location:      (form.elements.namedItem('location') as HTMLInputElement).value.trim(),
      consultant_id: (form.elements.namedItem('consultant_id') as HTMLSelectElement).value || null,
      active:        true,
      views:         0,
      downloads:     0,
    }
    if (!data.church || !data.contact || !data.email) {
      setError('Church name, contact, and email are required')
      setLoading(false)
      return
    }
    const { error } = await supabase.from('clients').insert(data)
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/admin/clients')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label className="label">Church / Organization Name *</label>
        <input name="church" type="text" className="input" placeholder="Grace Community Church" required />
      </div>
      <div>
        <label className="label">Primary Contact Name *</label>
        <input name="contact" type="text" className="input" placeholder="Pastor Jane Smith" required />
      </div>
      <div>
        <label className="label">Contact Email *</label>
        <input name="email" type="email" className="input" placeholder="jane@gracecc.org" required />
      </div>
      <div>
        <label className="label">City, State</label>
        <input name="location" type="text" className="input" placeholder="Nashville, TN" />
      </div>
      <div>
        <label className="label">Assigned Consultant</label>
        <select name="consultant_id" className="select">
          <option value="">— Unassigned —</option>
          {consultants.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.title}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-red text-sm p-3 rounded-lg" style={{background:'#fde8e4'}}>
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating…' : 'Create Client Portal →'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  )
}
