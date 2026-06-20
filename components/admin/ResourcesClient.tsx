'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Props { resources: any[]; user: any }

const RESOURCE_TYPES = ['guide', 'presentation', 'video', 'checklist', 'template']
const ICONS = ['📋', '🎓', '📄', '✅', '🧠', '🚨', '👥', '📁', '🔄', '📊']

export default function ResourcesClient({ resources: initial, user }: Props) {
  const [resources, setResources] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [editResource, setEditResource] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'guide', icon: '📋', description: '', file_url: '', default_download: true
  })
  const supabase = createClient()
  const router = useRouter()

  function openNew() {
    setEditResource(null)
    setForm({ name: '', type: 'guide', icon: '📋', description: '', file_url: '', default_download: true })
    setShowModal(true)
  }

  function openEdit(r: any) {
    setEditResource(r)
    setForm({
      name: r.name, type: r.type, icon: r.icon, description: r.description || '',
      file_url: r.file_url || '', default_download: r.default_download
    })
    setShowModal(true)
  }

  async function save() {
    if (!form.name) return alert('Name is required')
    setSaving(true)
    if (editResource) {
      const { data } = await supabase.from('resources').update(form).eq('id', editResource.id).select().single()
      if (data) setResources(prev => prev.map(r => r.id === editResource.id ? data : r))
    } else {
      const { data } = await supabase.from('resources').insert(form).select().single()
      if (data) setResources(prev => [...prev, data])
    }
    setSaving(false)
    setShowModal(false)
    router.refresh()
  }

  async function deleteResource(id: string) {
    if (!confirm('Delete this resource? It will be removed from all client portals.')) return
    await supabase.from('resources').delete().eq('id', id)
    setResources(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-darkText font-serif">Resource Library</h1>
          <p className="text-sm text-midGray mt-1">{resources.length} resources · assign these to clients from their profile</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ Add Resource</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Type</th>
              <th>File URL</th>
              <th>Views</th>
              <th>Downloads</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(r => (
              <tr key={r.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <div className="font-semibold text-darkText">{r.name}</div>
                      <div className="text-xs text-midGray">{r.description}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-gray capitalize">{r.type}</span></td>
                <td>
                  {r.file_url ? (
                    <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                      className="text-forest text-sm font-semibold hover:underline">View →</a>
                  ) : (
                    <span className="text-midGray text-sm">No file</span>
                  )}
                </td>
                <td className="text-midGray">{r.views || 0}</td>
                <td className="text-midGray">{r.downloads || 0}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className="btn-outline py-1 px-3 text-xs">✏️ Edit</button>
                    <button onClick={() => deleteResource(r.id)} className="btn-ghost py-1 px-3 text-xs text-red">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {!resources.length && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-midGray">
                  No resources yet. Click "+ Add Resource" to create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-darkText/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-tan bg-forest rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">{editResource ? 'Edit Resource' : 'New Resource'}</h2>
              <button onClick={() => setShowModal(false)} className="text-sageLt text-xl hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. De-Escalation Training Guide" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select className="select" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}>
                    {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Icon</label>
                  <select className="select" value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))}>
                    {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Brief description of this resource" />
              </div>
              <div>
                <label className="label">File URL</label>
                <input className="input" value={form.file_url} onChange={e => setForm(f => ({...f, file_url: e.target.value}))} placeholder="https://... (paste Supabase storage URL)" />
                <p className="text-xs text-midGray mt-1">Upload files in Supabase → Storage → resources bucket, then paste the URL here</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="accent-forest w-4 h-4" checked={form.default_download} onChange={e => setForm(f => ({...f, default_download: e.target.checked}))} />
                <span className="text-sm text-darkText">Allow downloads by default</span>
              </label>
            </div>
            <div className="flex gap-3 justify-end p-6 border-t border-tan">
              <button onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Resource'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
