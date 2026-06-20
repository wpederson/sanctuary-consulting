import { requireAdminUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ResourcesClient from '@/components/admin/ResourcesClient'

export default async function ResourcesPage() {
  const user = await requireAdminUser()
  const supabase = await createServerSupabaseClient()

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .order('name')

  return <ResourcesClient resources={resources || []} user={user} />
}
