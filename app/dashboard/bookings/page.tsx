import { getUserFromRequest } from '@/lib/auth'
import { getUserBusinesses } from '@/lib/actions'
import { redirect } from 'next/navigation'
import ProviderBookingManager from '@/components/ProviderBookingManager'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 border border-slate-200">
            <h1 className="text-3xl font-bold mb-4">📅 Quản Lý Lịch Hẹn</h1>
            <p className="text-slate-600 mb-6">Bạn cần tạo một doanh nghiệp trước khi có thể quản lý lịch hẹn.</p>
            <a href="/dashboard" className="btn btn-primary">
              Quay Lại Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 text-slate-900">📅 Quản Lý Lịch Hẹn</h1>
            {selectedBusiness && (
              <p className="text-slate-600">{selectedBusiness.name}</p>
            )}
          </div>
          <Link href="/dashboard" className="btn btn-outline gap-2">
            ← Quay Lại
          </Link>
        </motion.div>

        {/* Business Selector Tabs */}
        {businesses.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 flex gap-2 flex-wrap"
          >
            {businesses.map((b: any) => (
              <a
                key={b.id}
                href={`/dashboard/bookings?business=${b.id}`}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  b.id === selectedBusiness?.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {b.name}
              </a>
            ))}
          </motion.div>
        )}

        {/* Content */}
        {selectedBusiness ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <ProviderBookingManager businessId={selectedBusiness.id} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center"
          >
            <p className="text-lg text-slate-600">📭 Vui lòng chọn một doanh nghiệp</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
