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

  // Load each content section separately
  const [hero, services, approach, faqs, testimonials] = await Promise.all([
    supabase.from('site_content').select('content').eq('id', 'hero').single(),
    supabase.from('site_content').select('content').eq('id', 'services').single(),
    supabase.from('site_content').select('content').eq('id', 'approach').single(),
    supabase.from('site_content').select('content').eq('id', 'faqs').single(),
    supabase.from('site_content').select('content').eq('id', 'testimonials').single(),
  ])

  const content = {
    hero:         hero.data?.content || {},
    services:     services.data?.content || [],
    approach:     approach.data?.content || [],
    faqs:         faqs.data?.content || [],
    testimonials: testimonials.data?.content || [],
  }

  return <LandingPage content={content} />
}

export const dynamic = 'force-dynamic'
