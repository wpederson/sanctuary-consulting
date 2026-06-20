import { requireAdminUser, isConsultant } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const user = await requireAdminUser()
  const supabase = await createServerSupabaseClient()

  // Fetch counts
  const [{ count: clientCount }, { count: resourceCount }, { count: invoiceCount }] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('resources').select('*', { count: 'exact', head: true }),
    supabase.from('invoices').select('*', { count: 'exact', head: true }),
  ])

  const { data: recentActivity } = await supabase
    .from('activity_log')
    .select('*, clients(church), resources(name)')
    .order('created_at', { ascending: false })
    .limit(8)

  const greeting = isConsultant(user) ? `Welcome back, ${user.name.split(' ')[0]} 👋` : 'Dashboard Overview'

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-darkText font-serif">{greeting}</h1>
        <p className="text-midGray text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Clients', value: clientCount || 0, icon: '🏛', href: '/admin/clients' },
          { label: 'Resources', value: resourceCount || 0, icon: '📁', href: '/admin/resources' },
          { label: 'Invoices', value: invoiceCount || 0, icon: '🧾', href: '/admin/invoices' },
        ].map(stat => (
          <Link key={stat.label} href={stat.href} className="card hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold text-forest">{stat.value}</div>
            <div className="text-sm text-midGray mt-1">{stat.label}</div>
          </Link>
        ))}
        <div className="card">
          <div className="text-2xl mb-2">📞</div>
          <div className="text-sm font-bold text-darkText">Support</div>
          <a href="tel:6126004034" className="text-sm text-forest font-bold mt-1 block">612-600-4034</a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-bold text-darkText mb-4">Recent Activity</h2>
        {recentActivity?.length ? (
          <div className="space-y-3">
            {recentActivity.map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-sage flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-semibold">{log.user_email}</span>
                  {' '}{log.action}{' '}
                  {log.resources && <span className="text-forest font-medium">{(log.resources as any).name}</span>}
                  {' — '}<span className="text-midGray">{(log.clients as any)?.church}</span>
                </div>
                <div className="text-midGray text-xs flex-shrink-0">
                  {new Date(log.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-midGray text-sm">No activity recorded yet.</p>
        )}
      </div>
    </div>
  )
}
