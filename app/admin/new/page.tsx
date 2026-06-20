import { requireAdminUser, can } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import NewClientForm from '@/components/admin/NewClientForm'
import { redirect } from 'next/navigation'

export default async function NewClientPage() {
  const user = await requireAdminUser()
  if (!can(user, 'editClients')) redirect('/admin/clients')

  const supabase = await createServerSupabaseClient()
  const { data: consultants } = await supabase
    .from('consultants')
    .select('id, name, title')
    .eq('active', true)
    .order('name')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-darkText font-serif">Add New Client</h1>
        <p className="text-sm text-midGray mt-1">Create a client portal for a new congregation</p>
      </div>
      <NewClientForm consultants={consultants || []} />
    </div>
  )
}
