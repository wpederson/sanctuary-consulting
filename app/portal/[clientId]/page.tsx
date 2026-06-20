import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import ClientPortal from '@/components/client/ClientPortal'

interface Props {
  params: { clientId: string }
}

export default async function PortalPage({ params }: Props) {
  const supabase = await createServerSupabaseClient()

  // Verify user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/portal/${params.clientId}/login`)

  // Load client — verify this user owns this portal
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.clientId)
    .single()

  if (!client) notFound()

  // Access control: user email must match client email, OR be an admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .eq('active', true)
    .single()

  if (!adminUser && user.email !== client.email) {
    redirect('/login')
  }

  // Log this access
  await supabase.from('activity_log').insert({
    client_id: client.id,
    user_email: user.email,
    action: 'Viewed portal',
  })

  // Update last_access and increment views
  await supabase
    .from('clients')
    .update({ last_access: new Date().toISOString(), views: (client.views || 0) + 1 })
    .eq('id', client.id)

  // Load resources assigned to this client
  const { data: clientResources } = await supabase
    .from('client_resources')
    .select('*, resources(*)')
    .eq('client_id', client.id)
    .eq('can_view', true)

  // Load consultant
  const { data: consultant } = client.consultant_id
    ? await supabase.from('consultants').select('*').eq('id', client.consultant_id).single()
    : { data: null }

  // Load invoices (visible ones only if client user)
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

// Generate static params for ISR (optional — remove if fully dynamic)
export const dynamic = 'force-dynamic'
