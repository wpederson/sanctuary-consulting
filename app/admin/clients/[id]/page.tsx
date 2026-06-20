import { requireAdminUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ClientDetailClient from '@/components/admin/ClientDetailClient'

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

  const { data: allConsultants } = await supabase
    .from('consultants')
    .select('id, name, title')
    .eq('active', true)
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

  return (
    <ClientDetailClient
      client={client}
      clientResources={clientResources || []}
      allResources={allResources || []}
      allConsultants={allConsultants || []}
      invoices={invoices || []}
      activity={activity || []}
      user={user}
    />
  )
}
