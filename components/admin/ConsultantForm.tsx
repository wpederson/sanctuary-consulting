'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Props {
  consultant: any | null
  assignedClients?: any[]
}

const COLORS = ['forest', 'teal', 'sage', 'gold', 'amber']
const COLOR_HEX: Record<string, string> = {
  forest: '#2C4A3E', teal: '#2E7D6B', sage: '#5C8374', gold: '#C8963E', amber: '#D4820A'
}
const SPECIALTIES_OPTIONS = [
  'Security Strategy', 'De-Escalation Training', 'Policy Development',
  'CIT Training', 'Mental Health Awareness', 'Volunteer Development',
  'Crisis Intervention', 'First Responder Coordination', 'Cultural Integration',
  'Leadership Training', 'Crisis Communication'
]

export default function ConsultantForm({ consultant, assignedClients = [] }: Props) {
  const isEdit = !!consultant
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [photoUrl, setPhotoUrl] = useState(consultant?.photo_url || '')
  const [photoPreview, setPhotoPreview] = useState(consultant?.photo_url || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  const [form, setForm] = useState({
    name:        consultant?.name || '',
    title:       consultant?.title || '',
    email:       consultant?.email || '',
    mobile:      consultant?.mobile || '',
    phone:       consultant?.phone || '',
    bio:         consultant?.bio || '',
    specialties: consultant?.specialties || [] as string[],
    color:       consultant?.color || 'sage',
    active:      consultant?.active ?? true,
  })

  function toggleSpecialty(s: string) {
    setForm(f => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x: string) => x !== s)
        : [...f.specialties, s]
    }))
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Photo must be under 2MB'); return }
    setUploading(true)
    const path = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const { error: uploadError } = await supabase.storage
      .from('consultant-photos')
      .upload(path, file, { upsert: true })
    if (uploadError) { setError('Photo upload failed: ' + uploadError.message); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('consultant-photos').getPublicUrl(path)
    setPhotoUrl(urlData.publicUrl)
    setPhotoPreview(urlData.publicUrl)
    setUploading(false)
  }

  async function handleSave() {
    if (!form.name || !form.email || !form.mobile) {
      setError('Name, email, and mobile are required')
      return
    }
    setSaving(true)
    setError('')
    const avatar = form.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    const payload = { ...form, avatar, photo_url: photoUrl }

    if (isEdit) {
      const { error: err } = await supabase.from('consultants').update(payload).eq('id', consultant.id)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase.from('consultants').insert(payload)
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false)
    router.push('/admin/consultants')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Delete ${consultant?.name}? This cannot be undone.`)) return
    setDeleting(true)
    await supabase.from('consultants').delete().eq('id', consultant.id)
    router.push('/admin/consultants')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Photo */}
      <div className="card">
        <h2 className="text-base font-bold text-darkText mb-4">Profile Photo</h2>
        <div className="flex items-center gap-6">
          {photoPreview ? (
            <div className="relative">
              <img src={photoPreview} alt="Preview"
                className="w-20 h-20 rounded-full object-cover border-2 border-tan" />
              <button
                onClick={() => { setPhotoUrl(''); setPhotoPreview('') }}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red text-white text-xs flex items-center justify-center"
              >✕</button>
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: COLOR_HEX[form.color] || '#5C8374' }}
            >
              {form.name ? form.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
            </div>
          )}
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-outline py-2 px-4 text-sm"
            >
              {uploading ? 'Uploading…' : '📷 Upload Photo'}
            </button>
            <p className="text-xs text-midGray mt-1">JPG or PNG · Max 2MB · Square crop recommended</p>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
          className="hidden" onChange={handlePhotoUpload} />
      </div>

      {/* Details */}
      <div className="card space-y-4">
        <h2 className="text-base font-bold text-darkText">Profile Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Jordan Blake" />
          </div>
          <div>
            <label className="label">Title / Role</label>
            <input className="input" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Training Specialist" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="jordan@sanctuary.consulting" />
          </div>
          <div>
            <label className="label">Mobile * <span className="text-midGray font-normal">(shown to clients)</span></label>
            <input className="input" type="tel" value={form.mobile} onChange={e => setForm(f => ({...f, mobile: e.target.value}))} placeholder="615-555-0100" />
          </div>
          <div>
            <label className="label">Office Phone</label>
            <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="615-555-0200 (optional)" />
          </div>
          <div>
            <label className="label">Profile Color</label>
            <select className="select" value={form.color} onChange={e => setForm(f => ({...f, color: e.target.value}))}>
              {COLORS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Bio</label>
            <textarea className="input" rows={3} value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} placeholder="Brief background and experience…" />
          </div>
          {isEdit && (
            <div>
              <label className="label">Status</label>
              <select className="select" value={form.active ? 'true' : 'false'} onChange={e => setForm(f => ({...f, active: e.target.value === 'true'}))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Specialties */}
      <div className="card">
        <h2 className="text-base font-bold text-darkText mb-3">Specialties</h2>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => toggleSpecialty(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                form.specialties.includes(s)
                  ? 'bg-forest text-white border-forest'
                  : 'border-tan text-midGray hover:border-sage'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Assigned clients (edit only) */}
      {isEdit && assignedClients.length > 0 && (
        <div className="card">
          <h2 className="text-base font-bold text-darkText mb-3">Assigned Clients ({assignedClients.length})</h2>
          <div className="space-y-2">
            {assignedClients.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                <div>
                  <div className="font-semibold text-sm text-darkText">{c.church}</div>
                  <div className="text-xs text-midGray">{c.contact}</div>
                </div>
                <a href={`/admin/clients/${c.id}`} className="text-forest text-xs font-semibold hover:underline">
                  Manage →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg text-sm font-semibold" style={{background:'#fde8e4', color:'#C0392B'}}>
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving || uploading} className="btn-primary">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Consultant →'}
        </button>
        <button onClick={() => router.back()} className="btn-ghost">Cancel</button>
        {isEdit && (
          <button onClick={handleDelete} disabled={deleting} className="ml-auto btn-ghost text-sm" style={{color:'#C0392B'}}>
            {deleting ? 'Deleting…' : '🗑 Delete Consultant'}
          </button>
        )}
      </div>
    </div>
  )
}
