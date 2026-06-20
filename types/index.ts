export type UserRole = 'super_admin' | 'admin' | 'manager' | 'consultant'
export type InvoiceStatus = 'draft' | 'sent' | 'paid'

export interface AdminUser {
  id: string
  auth_user_id: string
  name: string
  email: string
  role: UserRole
  title?: string
  avatar?: string
  color?: string
  consultant_id?: string
  active: boolean
  last_login?: string
  created_at: string
}

export interface Consultant {
  id: string
  name: string
  title?: string
  email: string
  mobile: string
  phone?: string
  bio?: string
  specialties: string[]
  avatar?: string
  color?: string
  photo_url?: string
  active: boolean
  created_at: string
}

export interface Client {
  id: string
  church: string
  contact: string
  email: string
  location?: string
  lat?: number
  lng?: number
  active: boolean
  consultant_id?: string
  views: number
  downloads: number
  last_access?: string
  notes?: string
  goals: Goal[]
  next_call?: string
  next_call_type?: string
  next_call_note?: string
  portal_password?: string
  created_at: string
}

export interface Goal {
  id: string
  text: string
  done: boolean
}

export interface Resource {
  id: string
  name: string
  type: 'guide' | 'presentation' | 'video' | 'checklist' | 'template'
  icon: string
  desc: string
  file_url?: string
  default_download: boolean
  views: number
  downloads: number
  created_at: string
}

export interface ClientResource {
  id: string
  client_id: string
  resource_id: string
  can_view: boolean
  can_download: boolean
  can_share: boolean
  assigned_by?: string
  created_at: string
}

export interface Invoice {
  id: string
  client_id: string
  number: string
  issue_date: string
  due_date: string
  status: InvoiceStatus
  notes?: string
  show_client: boolean
  line_items: LineItem[]
  created_by?: string
  created_at: string
}

export interface LineItem {
  desc: string
  qty: number
  price: number
}

export interface ActivityLog {
  id: string
  client_id: string
  user_email: string
  action: string
  resource_id?: string
  created_at: string
}

export interface TrainingAssignment {
  id: string
  consultant_id: string
  client_id: string
  type: string
  date?: string
  notes?: string
  completed: boolean
  created_at: string
}
