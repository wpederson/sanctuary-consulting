import { requireAdminUser, can, isConsultant } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminUser()

  return (
    <div className="admin-layout">
      <AdminSidebar user={user} />
      <main className="admin-main">{children}</main>
    </div>
  )
}
