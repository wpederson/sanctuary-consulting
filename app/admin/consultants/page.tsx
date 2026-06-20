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
        {consultants?.map(con => (
          <div key={con.id} className="card">
            <div className="flex items-center gap-3 mb-4">
              {con.photo_url ? (
                <img src={con.photo_url} alt={con.name}
                  className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ background: con.color === 'forest' ? '#2C4A3E' : con.color === 'teal' ? '#2E7D6B' : '#5C8374' }}
                >
                  {con.avatar}
                </div>
              )}
              <div>
                <div className="font-bold text-darkText">{con.name}</div>
                <div className="text-xs text-midGray">{con.title}</div>
              </div>
            </div>
            {con.bio && <p className="text-sm text-midGray mb-3">{con.bio}</p>}
            <div className="flex flex-wrap gap-1 mb-4">
              {(con.specialties || []).map((s: string) => (
                <span key={s} className="text-xs bg-emerald-50 text-forest px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
            <div className="text-xs text-midGray space-y-1 mb-4">
              <div>📱 {con.mobile}</div>
              <div>✉️ {con.email}</div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/consultants/${con.id}`} className="btn-outline py-1 px-3 text-xs">Edit Profile</Link>
              <span className={`badge ${con.active ? 'badge-green' : 'badge-gray'}`}>
                {con.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
        {!consultants?.length && (
          <div className="col-span-3 text-center py-16 text-midGray">
            <div className="text-5xl mb-4">👤</div>
            <p>No consultants yet.</p>
            <Link href="/admin/consultants/new" className="text-forest font-semibold">Add your first consultant →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
