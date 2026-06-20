'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  client: any
  clientResources: any[]
  allResources: any[]
  allConsultants: any[]
  invoices: any[]
  activity: any[]
  user: any
}

export default function ClientDetailClient({
  client, clientResources, allResources, allConsultants, invoices, activity, user
}: Props) {
  const [saving, setSaving] = useState(false)
  const [consultantId, setConsultantId] = useState(client.consultant_id || '')
  const [active, setActive] = useState(client.active)
  const [success, setSuccess] = useState('')
  const [resourceSaving, setResourceSaving] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const assignedIds = new Set(clientResources.map(cr => cr.resource_id))

  async function saveClientDetails() {
    setSaving(true)
    await supabase.from('clients').update({
      consultant_id: consultantId || null,
      active,
    }).eq('id', client.id)
    setSaving(false)
    setSuccess('Saved!')
    setTimeout(() => setSuccess(''), 2000)
    router.refresh()
  }

  async function toggleResource(resourceId: string, currentlyAssigned: boolean) {
    setResourceSaving(resourceId)
    if (currentlyAssigned) {
      await supabase.from('client_resources')
        .delete()
        .eq('client_id', client.id)
        .eq('resource_id', resourceId)
    } else {
      await supabase.from('client_resources').insert({
        client_id: client.id,
        resource_id: resourceId,
        can_view: true,
        can_download: true,
        can_share: false,
      })
    }
    setResourceSaving(null)
    router.refresh()
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/admin/clients" className="text-sm text-midGray hover:text-forest mb-2 inline-block">
            ← Back to Clients
          </Link>
          <h1 className="text-2xl font-bold text-darkText font-serif">{client.church}</h1>
          <p className="text-sm text-midGray mt-1">{client.contact} · {client.email} · {client.location}</p>
        </div>
        <Link href={`/portal/${client.id}`} target="_blank" className="btn-outline">
          👁 Preview Portal
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Resource assignment */}
          <div className="card">
            <h2 className="text-lg font-bold text-darkText mb-4">Resource Access</h2>
            <p className="text-sm text-midGray mb-4">Toggle resources on or off for this client. Changes take effect immediately.</p>
            <div className="space-y-2">
              {allResources.map(r => {
                const assigned = assignedIds.has(r.id)
                const loading = resourceSaving === r.id
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-cream">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-darkText">{r.name}</div>
                        <div className="text-xs text-midGray capitalize">{r.type}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleResource(r.id, assigned)}
                      disabled={loading}
                      className={assigned ? 'btn-primary py-1 px-3 text-xs' : 'btn-ghost py-1 px-3 text-xs border border-tan'}
                    >
                      {loading ? '…' : assigned ? '✓ Assigned' : '+ Assign'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-lg font-bold text-darkText mb-4">Recent Activity</h2>
            {activity.length ? (
              <div className="space-y-3">
                {activity.map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-sage flex-shrink-0" />
                    <div className="flex-1">
                      <span>{log.action}</span>
                      {log.resources && (
                        <span className="text-forest font-medium ml-1">
                          {log.resources.icon} {log.resources.name}
                        </span>
                      )}
                    </div>
                    <div className="text-midGray text-xs">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-midGray text-sm">No activity yet.</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Edit client settings */}
          <div className="card">
            <h2 className="text-base font-bold text-darkText mb-4">Client Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Assigned Consultant</label>
                <select
                  className="select"
                  value={consultantId}
                  onChange={e => setConsultantId(e.target.value)}
                >
                  <option value="">— Unassigned —</option>
                  {allConsultants.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select
                  className="select"
                  value={active ? 'true' : 'false'}
                  onChange={e => setActive(e.target.value === 'true')}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <button
                onClick={saveClientDetails}
                disabled={saving}
                className="btn-primary w-full justify-center"
              >
                {saving ? 'Saving…' : success ? '✅ ' + success : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Portal link */}
          <div className="card">
            <h2 className="text-base font-bold text-darkText mb-3">Portal Link</h2>
            <p className="text-xs text-midGray mb-2">Share this URL with the client:</p>
            <div className="bg-cream rounded-lg p-3 text-xs font-mono break-all text-forest">
              {process.env.NEXT_PUBLIC_APP_URL}/portal/{client.id}
            </div>
          </div>

          {/* Invoices */}
          <div className="card">
            <h2 className="text-base font-bold text-darkText mb-3">Invoices</h2>
            {invoices.length ? (
              <div className="space-y-2">
                {invoices.slice(0, 3).map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs text-midGray">{inv.number}</span>
                    <span className={`badge ${inv.status === 'paid' ? 'badge-green' : inv.status === 'sent' ? 'badge-blue' : 'badge-gray'}`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-midGray">No invoices yet.</p>
            )}
            <Link href="/admin/invoices" className="text-xs text-forest font-semibold mt-3 inline-block">
              Manage invoices →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
