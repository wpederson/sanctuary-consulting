import { requireAdminUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function ConsultantsPage() {
  const user = await requireAdminUser()
  const supabase = await createServerSupabaseClient()

  const { data: consultants } = await supabase
    .from('consultants')
    .select('*')
    .order('name')

  const { data: clients } = await supabase
    .from('clients')
    .select('id, church, consultant_id')

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-darkText font-serif">Consultant Team</h1>
          <p className="text-sm text-midGray mt-1">{consultants?.length || 0} consultants</p>
        </div>
        <Link href="/admin/consultants/new" className="btn-primary">+ Add Consultant</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {consultants?.map(con => {
          const myClients = clients?.filter(c => c.consultant_id === con.id) || []
          const bgColor = con.color === 'forest' ? '#2C4A3E' : con.color === 'teal' ? '#2E7D6B' : con.color === 'gold' ? '#C8963E' : con.color === 'amber' ? '#D4820A' : '#5C8374'
          return (
            <div key={con.id} className={`card ${!con.active ? 'opacity-60' : ''}`}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                {con.photo_url ? (
                  <img src={con.photo_url} alt={con.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ background: bgColor }}
                  >
                    {con.avatar}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-darkText">{con.name}</div>
                  <div className="text-xs text-midGray">{con.title}</div>
                  <span className={`badge ${con.active ? 'badge-green' : 'badge-gray'} mt-1`}>
                    {con.active ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>

              {/* Bio */}
              {con.bio && <p className="text-sm text-midGray mb-3 line-clamp-2">{con.bio}</p>}

              {/* Specialties */}
              <div className="flex flex-wrap gap-1 mb-3">
                {(con.specialties || []).slice(0, 3).map((s: string) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{background:'#e8f0ec', color:'#2C4A3E'}}>{s}</span>
                ))}
              </div>

              {/* Contact */}
              <div className="text-xs text-midGray space-y-1 mb-3">
                <div>📱 {con.mobile}</div>
                <div>✉️ {con.email}</div>
              </div>

              {/* Clients */}
              {myClients.length > 0 && (
                <div className="text-xs text-midGray mb-4">
                  🏛 {myClients.length} client{myClients.length !== 1 ? 's' : ''} assigned
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <Link href={`/admin/consultants/${con.id}`} className="btn-primary py-1.5 px-3 text-xs">
                  ✏️ Edit Profile
                </Link>
                <Link href={`/admin/consultants/${con.id}`} className="btn-ghost py-1.5 px-3 text-xs">
                  👥 Clients
                </Link>
              </div>
            </div>
          )
        })}

        {!consultants?.length && (
          <div className="col-span-3 text-center py-16 text-midGray">
            <div className="text-5xl mb-4">👤</div>
            <p className="mb-3">No consultants yet.</p>
            <Link href="/admin/consultants/new" className="btn-primary">Add your first consultant →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
