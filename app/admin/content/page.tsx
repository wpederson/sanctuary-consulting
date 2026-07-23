import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import ContentClient from '@/components/admin/ContentClient'

export default async function ContentPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('auth_user_id', user.id)
    .eq('active', true)
    .single()

  if (!adminUser) redirect('/login')

  const { data: rows } = await supabase
    .from('site_content')
    .select('*')

  const content: Record<string, any> = {}
  rows?.forEach(row => { content[row.id] = row.content })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-darkText font-serif">🖊 Website Content</h1>
        <p className="text-sm text-midGray mt-1">Edit the text on your public landing page. Changes go live immediately.</p>
      </div>
      <ContentClient content={content} />
    </div>
  )
}

export const dynamic = 'force-dynamic'
