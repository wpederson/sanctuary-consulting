import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: adminUser } = await supabase
      .from('admin_users').select('id').eq('auth_user_id', user.id).single()
    if (adminUser) redirect('/admin')

    const { data: client } = await supabase
      .from('clients').select('id').eq('email', user.email).single()
    if (client) redirect(`/portal/${client.id}`)
  }

  // Load content from database
  const { data: rows } = await supabase.from('site_content').select('*')
  const content: Record<string, any> = {}
  rows?.forEach(row => { content[row.id] = row.content })

  return <LandingPage content={content} />
}

export const dynamic = 'force-dynamic'
