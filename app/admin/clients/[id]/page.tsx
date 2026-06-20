import { requireAdminUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireAdminUser()
  const supabase = await createServerSupabaseClient()

  const { data: client } = await supabase
    .from('clients')
    .select('*, consultants(id, name, title, email, mobile)')
    .eq('id', id)
    .single()

  if (!client) notFound()

  const { data: clientResources } = await supabase
    .from('client_resources')
    .select('*, resources(*)')
    .eq('client_id', id)

  const { data: allResources } = await supabase
    .from('resources')
    .select('*')
    .order('name')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', id)
    .order('created_at', { ascending: false })

  const { data: activity } = await supabase
    .from('activity_log')
    .select('*, resources(name, icon)')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const assignedIds = new Set(clientResources?.map(cr => cr.resource_id))

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
        <div className="flex gap-3">
          <Link href={`/portal/${client.id}`} target="_blank" className="btn-outline">
            👁 Preview Portal
          </Link>
          <span className={`badge ${client.active ? 'badge-green' : 'badge-gray'} self-center`}>
            {client.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Resources */}
          <div className="card">
            <h2 className="text-lg font-bold text-darkText mb-4">Resource Access</h2>
            <div className="space-y-2">
              {allResources?.map(r => {
                const assigned = assignedIds.has(r.id)
                const cr = clientResources?.find(x => x.resource_id === r.id)
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-cream">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-darkText">{r.name}</div>
                        <div className="text-xs text-midGray capitalize">{r.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assigned ? (
                        <span className="badge badge-green">✓ Assigned</span>
                      ) : (
                        <span className="badge badge-gray">Not assigned</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-lg font-bold text-darkText mb-4">Recent Activity</h2>
            {activity?.length ? (
              <div className="space-y-3">
                {activity.map(log => (
                  <div key={log.id} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-sage flex-shrink-0" />
                    <div className="flex-1">
                      <span>{log.action}</span>
                      {(log.resources as any) && (
                        <span className="text-forest font-medium ml-1">
                          {(log.resources as any).icon} {(log.resources as any).name}
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

          {/* Consultant */}
          <div className="card">
            <h2 className="text-base font-bold text-darkText mb-3">Assigned Consultant</h2>
            {client.consultants ? (
              <div>
                <div className="font-semibold">{(client.consultants as any).name}</div>
                <div className="text-sm text-midGray">{(client.consultants as any).title}</div>
                <div className="text-sm text-midGray mt-1">📱 {(client.consultants as any).mobile}</div>
                <div className="text-sm text-midGray">✉️ {(client.consultants as any).email}</div>
              </div>
            ) : (
              <p className="text-sm text-midGray">No consultant assigned</p>
            )}
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
            {invoices?.length ? (
              <div className="space-y-2">
                {invoices.slice(0, 3).map(inv => (
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
