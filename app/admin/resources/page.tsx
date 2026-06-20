import { requireAdminUser } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function ResourcesPage() {
  const user = await requireAdminUser()
  const supabase = await createServerSupabaseClient()

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .order('name')

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-darkText font-serif">Resource Library</h1>
          <p className="text-sm text-midGray mt-1">{resources?.length || 0} resources available</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Type</th>
              <th>Views</th>
              <th>Downloads</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {resources?.map(r => (
              <tr key={r.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{r.icon}</span>
                    <div>
                      <div className="font-semibold text-darkText">{r.name}</div>
                      <div className="text-xs text-midGray">{r.description}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-gray capitalize">{r.type}</span>
                </td>
                <td className="text-midGray">{r.views || 0}</td>
                <td className="text-midGray">{r.downloads || 0}</td>
                <td>
                  {r.file_url ? (
                    <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                      className="text-forest text-sm font-semibold hover:underline">
                      View file →
                    </a>
                  ) : (
                    <span className="text-midGray text-sm">No file</span>
                  )}
                </td>
              </tr>
            ))}
            {!resources?.length && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-midGray">
                  No resources yet. Add them in the Supabase Table Editor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
