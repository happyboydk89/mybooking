import Link from 'next/link'
import { getAllBusinesses } from '@/lib/actions'
import { getUserFromRequest } from '@/lib/auth'
import BusinessCardNew from '@/components/BusinessCardNew'

export default async function BusinessesPage() {
  const user = await getUserFromRequest()
  const businessResult = await getAllBusinesses()
  const businesses = businessResult.success ? (businessResult.businesses ?? []) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium inline-block mb-4">
            ← Quay lại
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">Tất Cả Doanh Nghiệp</h1>
          <p className="text-slate-600">Hiện có {businesses.length} doanh nghiệp đang hoạt động trên hệ thống.</p>
        </div>

        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businesses.map((business: any, index: number) => (
              <BusinessCardNew
                key={business.id}
                business={business}
                index={index}
                userLoggedIn={!!user}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Chưa có doanh nghiệp nào</h2>
            <p className="text-slate-600">Vui lòng quay lại sau hoặc thử tạo doanh nghiệp mới trong Dashboard.</p>
          </div>
        )}
      </div>
    </div>
  )
}
