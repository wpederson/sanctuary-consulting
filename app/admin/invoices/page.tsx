import { requireRole } from '@/lib/auth'
import InvoicesClient from '@/components/admin/InvoicesClient'

export default async function InvoicesPage() {
  const user = await requireRole(['super_admin', 'manager'])
  const supabase = await createServerSupabaseClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, clients(church, contact, email, location)')
    .order('created_at', { ascending: false })

  const { data: clients } = await supabase
    .from('clients')
    .select('id, church, contact, email')
    .eq('active', true)
    .order('church')

  return <InvoicesClient invoices={invoices || []} clients={clients || []} user={user} />
}
