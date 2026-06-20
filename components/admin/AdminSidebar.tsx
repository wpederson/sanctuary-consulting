'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AdminUser } from '@/types'
import { can, isConsultant } from '@/lib/auth'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ROLE_COLORS: Record<string, string> = {
  super_admin: '#C8963E',
  admin:       '#2C4A3E',
  manager:     '#2E7D6B',
  consultant:  '#5C8374',
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin:       'Admin',
  manager:     'Manager',
  consultant:  'Consultant',
}

interface Props { user: AdminUser }

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const consultantNav = [
    { href: '/admin',                   icon: '🏠', label: 'My Dashboard' },
    { href: '/admin/clients',           icon: '🏛', label: 'My Clients' },
    { href: '/admin/clients/trends',    icon: '📡', label: 'Global Trends' },
    { href: '/admin/resources',         icon: '📁', label: 'Resources' },
  ]

  const adminNav = [
    { href: '/admin',                   icon: '📊', label: 'Overview' },
    { href: '/admin/clients',           icon: '🏛', label: 'Clients' },
    { href: '/admin/consultants',       icon: '👤', label: 'Consultants' },
    { href: '/admin/resources',         icon: '📁', label: 'Resources' },
    ...( can(user, 'viewActivityLog') ? [{ href: '/admin/activity', icon: '📋', label: 'Activity Log' }] : []),
    ...( can(user, 'manageInvoices') ? [{ href: '/admin/invoices', icon: '🧾', label: 'Invoices' }] : []),
    ...( can(user, 'manageUsers') ? [{ href: '/admin/users', icon: '🔐', label: 'User Management' }] : []),
  ]

  const nav = isConsultant(user) ? consultantNav : adminNav

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="admin-sidebar">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-forestMd">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl">🕊</span>
          <div>
            <div className="text-white font-bold text-sm tracking-tight font-serif">SANCTUARY</div>
            <div className="text-goldLt text-xs tracking-widest uppercase" style={{fontSize:'9px'}}>Consulting</div>
          </div>
        </Link>
      </div>

      {/* User badge */}
      <div className="px-4 py-4 border-b border-forestMd">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: ROLE_COLORS[user.role] }}
          >
            {user.avatar || user.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user.name}</div>
            <div className="text-sageLt text-xs">{ROLE_LABELS[user.role]}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="text-sageLt text-xs font-bold uppercase tracking-wider px-2 mb-2">
          Navigation
        </div>
        {nav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Quick actions */}
      <div className="px-3 py-4 border-t border-forestMd space-y-2">
        {can(user, 'editClients') && (
          <Link href="/admin/clients/new" className="block text-center text-sm font-semibold bg-gold text-white rounded-lg px-3 py-2 hover:bg-amber transition-colors">
            + New Client
          </Link>
        )}
        <Link href="/" className="block text-center text-xs text-sageLt hover:text-white transition-colors py-1">
          🌐 View Home Page
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-center text-xs text-sageLt hover:text-white transition-colors py-1"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
