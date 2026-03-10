import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth'
import { getUserBusinesses } from '@/lib/actions'
import DashboardNav from '@/components/DashboardNav'
import CreateBusinessForm from '@/components/CreateBusinessForm'

export default async function Dashboard() {
  const user = await getUserFromRequest()
  if (!user) {
    redirect('/auth/login')
  }

  // Get all businesses for this user (regardless of role)
  const businessResult = await getUserBusinesses(user.id)
  const businesses = businessResult.success ? businessResult.businesses : []

  return (
    <div className="container mx-auto p-4">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📊 Dashboard</h1>
        <p className="text-lg text-gray-600">
          Xin chào, <span className="font-semibold">{user.name || user.email}</span>! 👋
        </p>
      </div>

      {/* If user has no business, show create form first */}
      {businesses.length === 0 && (
        <div className="mb-8 card bg-amber-50 border-2 border-amber-200 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-amber-900">🚀 Hãy bắt đầu ngay</h2>
            <p className="text-amber-800 mb-4">
              Tạo business đầu tiên của bạn để bắt đầu nhận lịch hẹn từ khách hàng.
            </p>
            <CreateBusinessForm userId={user.id} />
          </div>
        </div>
      )}

      {/* Navigation Cards */}
      {businesses.length > 0 && <DashboardNav businessCount={businesses.length} />}

      {/* Businesses Overview */}
      {businesses.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">📋 Các Businesses Của Bạn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businesses.map((business: any) => (
              <div key={business.id} className="card bg-base-100 shadow-md hover:shadow-lg transition">
                <div className="card-body">
                  <h3 className="card-title text-lg">{business.name}</h3>
                  <p className="text-sm text-gray-600">{business.description}</p>
                  <div className="flex gap-2 mt-2 text-xs text-gray-500">
                    <span>📍 {business.address}</span>
                    <span>•</span>
                    <span>🔧 {business.services?.length || 0} services</span>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <a
                      href={`/dashboard/services?business=${business.id}`}
                      className="btn btn-sm btn-outline"
                    >
                      Services
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Business */}
          <div className="mt-6 card bg-base-200 shadow-md">
            <div className="card-body">
              <h3 className="card-title mb-4">➕ Tạo Business Mới</h3>
              <CreateBusinessForm userId={user.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}