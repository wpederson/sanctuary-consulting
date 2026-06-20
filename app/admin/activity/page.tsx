import { requireAdminUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function ActivityPage() {
  const user = await requireAdminUser()
  const supabase = await createServerSupabaseClient()

  const { data: activity } = await supabase
    .from('activity_log')
    .select('*, clients(church), resources(name, icon)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-darkText font-serif">Activity Log</h1>
        <p className="text-sm text-midGray mt-1">Last 100 portal events across all clients</p>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Client</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
            </tr>
          </thead>
          <tbody>
            {activity?.map(log => (
              <tr key={log.id}>
                <td className="text-xs text-midGray whitespace-nowrap">
                  {new Date(log.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: 'numeric', minute: '2-digit', hour12: true
                  })}
                </td>
                <td>
                  <span className="font-semibold text-darkText">
                    {(log.clients as any)?.church || '—'}
                  </span>
                </td>
                <td className="text-sm text-midGray">{log.user_email}</td>
                <td>
                  <span className="badge badge-gray">{log.action}</span>
                </td>
                <td className="text-sm text-midGray">
                  {(log.resources as any)
                    ? `${(log.resources as any).icon} ${(log.resources as any).name}`
                    : '—'}
                </td>
              </tr>
            ))}
            {!activity?.length && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-midGray">
                  No activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
