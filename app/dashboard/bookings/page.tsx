import { getUserFromRequest } from '@/lib/auth'
import { getUserBusinesses } from '@/lib/actions'
import { redirect } from 'next/navigation'
import BookingManagementDashboard from '@/components/BookingManagementDashboard'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const user = await getUserFromRequest()
  if (!user) {
    redirect('/auth/login')
  }

  // Get all businesses for this user
  const businessResult = await getUserBusinesses(user.id)
  const businesses = businessResult.success ? businessResult.businesses : []

  const params = await searchParams
  const selectedBusinessId = params.business

  // Find selected business or use first one
  let selectedBusiness = businesses.find((b: any) => b.id === selectedBusinessId)
  if (!selectedBusiness && businesses.length > 0) {
    selectedBusiness = businesses[0]
  }

  if (businesses.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Quản Lý Lịch Hẹn</h1>
        <p className="text-gray-600">Bạn cần tạo một business trước tiên.</p>
        <a href="/dashboard" className="btn btn-primary mt-4">
          Quay Lại Dashboard
        </a>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {/* Top Navigation Bar */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">📅 Quản Lý Lịch Hẹn</h1>
          {selectedBusiness && (
            <p className="text-gray-600">{selectedBusiness.name}</p>
          )}
        </div>
        <Link href="/dashboard" className="btn btn-outline">
          ← Quay Lại Dashboard
        </Link>
      </div>

      {/* Business Selector Tabs */}
      {businesses.length > 1 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          {businesses.map((b: any) => (
            <a
              key={b.id}
              href={`/dashboard/bookings?business=${b.id}`}
              className={`btn btn-sm ${b.id === selectedBusiness?.id ? 'btn-primary' : 'btn-outline'}`}
            >
              {b.name}
            </a>
          ))}
        </div>
      )}

      {/* Content */}
      {selectedBusiness ? (
        <BookingManagementDashboard businessId={selectedBusiness.id} />
      ) : (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center py-12">
            <p className="text-lg text-gray-600">Vui lòng chọn một business</p>
          </div>
        </div>
      )}
    </div>
  )
}
