import { createServerSupabaseClient } from './supabase'
import { AdminUser, UserRole } from '@/types'
import { redirect } from 'next/navigation'

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('admin_users')
    .select('*')
    .eq('auth_user_id', user.id)
    .eq('active', true)
    .single()

  return data
}

export async function requireAdminUser(): Promise<AdminUser> {
  const user = await getAdminUser()
  if (!user) redirect('/login')
  return user
}

export async function requireRole(roles: UserRole[]): Promise<AdminUser> {
  const user = await requireAdminUser()
  if (!roles.includes(user.role as UserRole)) redirect('/admin')
  return user
}

export function can(user: AdminUser, permission: string): boolean {
  const perms: Record<string, UserRole[]> = {
    manageInvoices:  ['super_admin', 'manager'],
    manageUsers:     ['super_admin'],
    manageConsultants: ['super_admin', 'admin'],
    viewAllClients:  ['super_admin', 'admin', 'manager'],
    editClients:     ['super_admin', 'admin', 'manager', 'consultant'],
    deleteClients:   ['super_admin', 'admin'],
    manageResources: ['super_admin', 'admin', 'manager'],
    viewActivityLog: ['super_admin', 'admin', 'manager'],
    assignConsultants: ['super_admin', 'admin'],
  }
  return (perms[permission] || []).includes(user.role as UserRole)
}

export function isConsultant(user: AdminUser): boolean {
  return user.role === 'consultant'
}

export function isSuperAdmin(user: AdminUser): boolean {
  return user.role === 'super_admin'
}
