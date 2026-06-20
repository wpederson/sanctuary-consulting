import { requireAdminUser, can } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ConsultantForm from '@/components/admin/ConsultantForm'

export default async function NewConsultantPage() {
  const user = await requireAdminUser()
  if (!can(user, 'manageConsultants')) redirect('/admin/consultants')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <a href="/admin/consultants" className="text-sm text-midGray hover:text-forest mb-2 inline-block">
          ← Back to Consultants
        </a>
        <h1 className="text-2xl font-bold text-darkText font-serif">Add New Consultant</h1>
        <p className="text-sm text-midGray mt-1">Create a consultant profile</p>
      </div>
      <ConsultantForm consultant={null} />
    </div>
  )
}
