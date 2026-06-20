import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import ClientPortal from '@/components/client/ClientPortal'

export const dynamic = 'force-dynamic'

export default async function PortalPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/portal/${clientId}/login`)

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (!client) notFound()

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .eq('active', true)
    .single()

  if (!adminUser && user.email !== client.email) {
    redirect('/login')
  }

  await supabase.from('activity_log').insert({
    client_id: client.id,
    user_email: user.email,
    action: 'Viewed portal',
  })

  await supabase
    .from('clients')
    .update({ last_access: new Date().toISOString(), views: (client.views || 0) + 1 })
    .eq('id', client.id)

  const { data: clientResources } = await supabase
    .from('client_resources')
    .select('*, resources(*)')
    .eq('client_id', client.id)
    .eq('can_view', true)

  const { data: consultant } = client.consultant_id
    ? await supabase.from('consultants').select('*').eq('id', client.consultant_id).single()
    : { data: null }

  let invoicesQuery = supabase
    .from('invoices')
    .select('*')
    .eq('client_id', client.id)
    .order('issue_date', { ascending: false })

  if (!adminUser) invoicesQuery = invoicesQuery.eq('show_client', true)
  const { data: invoices } = await invoicesQuery

  return (
    <ClientPortal
      client={client}
      resources={clientResources || []}
      consultant={consultant}
      invoices={invoices || []}
      isAdmin={!!adminUser}
    />
  )
}
