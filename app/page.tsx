import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()
    if (adminUser) redirect('/admin')

    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('email', user.email)
      .single()
    if (client) redirect(`/portal/${client.id}`)
  }

  redirect('/login')
}

export const dynamic = 'force-dynamic'
