'use client'
import { useState, useRef } from 'react'
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
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [form, setForm] = useState({
    name: '', type: 'guide', icon: '📋', description: '', file_url: '', default_download: true
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadProgress('Uploading…')

    // Create a clean filename
    const ext = file.name.split('.').pop()
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `${Date.now()}_${cleanName}`

    const { data, error } = await supabase.storage
      .from('resources')
      .upload(path, file, { upsert: true })

    if (error) {
      setUploadProgress('Upload failed: ' + error.message)
      setUploading(false)
      return
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resources')
      .getPublicUrl(path)

    setForm(f => ({ ...f, file_url: urlData.publicUrl }))
    setUploadProgress('✅ Uploaded: ' + file.name)
    setUploading(false)
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
              <th>File</th>
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
                    <button onClick={() => deleteResource(r.id)} className="btn-ghost py-1 px-3 text-xs" style={{color:'#C0392B'}}>🗑</button>
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-tan bg-forest rounded-t-2xl">
