import { requireAdminUser, isConsultant, can } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import ClientsTable from '@/components/admin/ClientsTable'

export default async function ClientsPage() {
  const user = await requireAdminUser()
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('clients')
    .select('*, consultants(name, avatar, color), client_resources(id)')
    .order('church')

  // Consultants only see their own clients
  if (isConsultant(user) && user.consultant_id) {
    query = query.eq('consultant_id', user.consultant_id)
  }

  const { data: clients } = await query
  const { data: consultants } = await supabase.from('consultants').select('id, name').eq('active', true)

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-darkText font-serif">
            {isConsultant(user) ? 'My Clients' : 'All Clients'}
          </h1>
          <p className="text-midGray text-sm mt-1">
            {clients?.length || 0} client{(clients?.length || 0) !== 1 ? 's' : ''}
          </p>
        </div>
        {can(user, 'editClients') && (
          <Link href="/admin/clients/new" className="btn-primary">
            + New Client
          </Link>
        )}
      </div>
      <ClientsTable clients={clients || []} user={user} consultants={consultants || []} />
    </div>
  )
}
