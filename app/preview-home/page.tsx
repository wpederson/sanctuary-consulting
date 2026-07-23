import { createServerSupabaseClient } from '@/lib/supabase-server'
import LandingPage from '@/components/LandingPage'

export default async function PreviewHomePage() {
  const supabase = await createServerSupabaseClient()

  const [heroRes, servicesRes, approachRes, faqsRes, testimonialsRes] = await Promise.all([
    supabase.from('site_content').select('content').eq('id', 'hero').single(),
    supabase.from('site_content').select('content').eq('id', 'services').single(),
    supabase.from('site_content').select('content').eq('id', 'approach').single(),
    supabase.from('site_content').select('content').eq('id', 'faqs').single(),
    supabase.from('site_content').select('content').eq('id', 'testimonials').single(),
  ])

  const content = {
    hero:         heroRes.data?.content || {},
    services:     servicesRes.data?.content || [],
    approach:     approachRes.data?.content || [],
    faqs:         faqsRes.data?.content || [],
    testimonials: testimonialsRes.data?.content || [],
  }

  return <LandingPage content={content} />
}

export const dynamic = 'force-dynamic'
