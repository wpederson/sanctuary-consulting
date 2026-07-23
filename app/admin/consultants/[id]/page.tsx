import { requireAdminUser, can } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import ConsultantForm from '@/components/admin/ConsultantForm'

export default async function EditConsultantPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireAdminUser()
  if (!can(user, 'manageConsultants')) redirect('/admin/consultants')

  const supabase = await createServerSupabaseClient()

  const { data: consultant } = await supabase
    .from('consultants')
    .select('*')
    .eq('id', id)
    .single()

  if (!consultant) notFound()

  const { data: assignedClients } = await supabase
    .from('clients')
    .select('id, church, contact')
    .eq('consultant_id', id)
    .order('church')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <a href="/admin/consultants" className="text-sm text-midGray hover:text-forest mb-2 inline-block">
          ← Back to Consultants
        </a>
        <h1 className="text-2xl font-bold text-darkText font-serif">Edit Consultant</h1>
        <p className="text-sm text-midGray mt-1">{consultant.name}</p>
      </div>
      <ConsultantForm consultant={consultant} assignedClients={assignedClients || []} />
    </div>
  )
}
