import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  consultant: 'Consultant',
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: '#C8963E',
  admin: '#2C4A3E',
  manager: '#2E7D6B',
  consultant: '#5C8374',
}

export default async function UsersPage() {
  const user = await requireRole(['super_admin'])
  const supabase = await createServerSupabaseClient()

  const { data: users } = await supabase
    .from('admin_users')
    .select('*, consultants(name)')
    .order('created_at')

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-darkText font-serif">🔐 User Management</h1>
          <p className="text-sm text-midGray mt-1">Manage admin accounts and role assignments</p>
        </div>
      </div>

      <div className="card mb-6 bg-cream">
        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          <span className="px-3 py-1 rounded-full" style={{background:'#fff3cd',color:'#D4820A'}}>🌟 Super Admin — Full access including user management</span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-forest">🛡 Admin — Full access except user management</span>
          <span className="px-3 py-1 rounded-full" style={{background:'#d8f0ea',color:'#2E7D6B'}}>📋 Manager — Client oversight and invoices</span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-midGray">👤 Consultant — Own clients only</span>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Linked Consultant</th>
              <th>Last Login</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: ROLE_COLORS[u.role] || '#5C8374' }}
                    >
                      {u.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-darkText">{u.name}</div>
                      <div className="text-xs text-midGray">{u.title}</div>
                    </div>
                  </div>
                </td>
                <td className="text-sm text-midGray">{u.email}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: u.role === 'super_admin' ? '#fff3cd' : u.role === 'admin' ? '#e8f0ec' : u.role === 'manager' ? '#d8f0ea' : '#f0f0f0',
                      color: ROLE_COLORS[u.role] || '#666'
                    }}
                  >
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                </td>
                <td className="text-sm text-midGray">
                  {(u.consultants as any)?.name || '—'}
                </td>
                <td className="text-xs text-midGray">
                  {u.last_login
                    ? new Date(u.last_login).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'})
                    : 'Never'}
                </td>
                <td>
                  <span className={`badge ${u.active ? 'badge-green' : 'badge-gray'}`}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {!users?.length && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-midGray">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
