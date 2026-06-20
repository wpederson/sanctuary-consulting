'use client'
import { AdminUser } from '@/types'
import Link from 'next/link'

interface Props {
  clients: any[]
  user: AdminUser
  consultants: any[]
}

export default function ClientsTable({ clients, user, consultants }: Props) {
  return (
    <div className="card p-0 overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            <th>Church / Organization</th>
            <th>Contact</th>
            <th>Consultant</th>
            <th>Resources</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => {
            const con = c.consultants
            const resCount = c.client_resources?.length || 0
            return (
              <tr key={c.id}>
                <td>
                  <div className="font-semibold text-darkText">{c.church}</div>
                  <div className="text-xs text-midGray">{c.location}</div>
                </td>
                <td>
                  <div>{c.contact}</div>
                  <div className="text-xs text-midGray">{c.email}</div>
                </td>
                <td>
                  {con ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: con.color === 'forest' ? '#2C4A3E' : con.color === 'teal' ? '#2E7D6B' : '#5C8374' }}
                      >
                        {con.avatar}
                      </div>
                      <span className="text-sm">{con.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-midGray">Unassigned</span>
                  )}
                </td>
                <td>
                  <span className="badge badge-gray">{resCount} assigned</span>
                </td>
                <td>
                  <span className={`badge ${c.active ? 'badge-green' : 'badge-gray'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Link href={`/admin/clients/${c.id}`} className="btn-outline py-1 px-3 text-xs">
                      Manage
                    </Link>
                    <Link href={`/portal/${c.id}`} className="btn-ghost py-1 px-3 text-xs" target="_blank">
                      Preview →
                    </Link>
                  </div>
                </td>
              </tr>
            )
          })}
          {!clients.length && (
            <tr>
              <td colSpan={6} className="text-center py-12 text-midGray">
                No clients yet.{' '}
                <Link href="/admin/clients/new" className="text-forest font-semibold">Add your first client →</Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
