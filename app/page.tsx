import Link from 'next/link'
import { getAllUsers, getAllBusinesses } from '@/lib/actions'
import { getUserFromRequest } from '@/lib/auth'
import SearchBar from '@/components/SearchBar'
import CategoryCard from '@/components/CategoryCard'
import BusinessCardNew from '@/components/BusinessCardNew'

export default async function Home() {
  const result = await getAllUsers()
  const users = result.success ? (result.users ?? []) : []
  const totalBookings = users.reduce((sum: number, user: any) => sum + (user.bookings?.length || 0), 0)

  const user = await getUserFromRequest()

  const businessResult = await getAllBusinesses()
  const businesses = businessResult.success ? (businessResult.businesses ?? []) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden py-16 md:py-32 bg-gradient-to-b from-white via-indigo-50 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 bg-clip-text text-transparent mb-6 leading-tight">
                Đặt lịch dịch vụ chỉ trong 30 giây
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Kết nối với những nhà cung cấp dịch vụ hàng đầu. Đặt lịch, thanh toán, và quản lý dễ dàng.
              </p>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 mb-12">
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg border border-indigo-100">
                  <div className="text-2xl md:text-3xl font-bold text-indigo-600">{users.length}</div>
                  <div className="text-xs md:text-sm text-slate-600">Active Users</div>
                </div>
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg border border-cyan-100">
                  <div className="text-2xl md:text-3xl font-bold text-cyan-600">{businesses.length}</div>
                  <div className="text-xs md:text-sm text-slate-600">Businesses</div>
                </div>
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-lg border border-purple-100">
                  <div className="text-2xl md:text-3xl font-bold text-purple-600">{totalBookings}</div>
                  <div className="text-xs md:text-sm text-slate-600">Bookings</div>
                </div>
              </div>
            </div>

            {/* Search Bar Section */}
            <div className="relative z-10 mb-12">
              <SearchBar placeholder="Tìm theo tên Business hay loại hình (Salon, Clinic, Spa)..." />
            </div>

            {/* CTA Buttons for Non-Logged-In Users */}
            {!user && (
              <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:shadow-xl transition-all hover:from-indigo-700 hover:to-indigo-800 text-center"
                >
                  Bắt Đầu Miễn Phí
                </Link>
                <Link
                  href="/auth/login"
                  className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all text-center"
                >
                  Đăng Nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ CATEGORY SECTION ============ */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Duyệt theo loại hình dịch vụ
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tìm và đặt lịch với những dịch vụ tốt nhất theo nhu cầu của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryCard industry="HAIR_SALON" index={0} />
            <CategoryCard industry="CLINIC" index={1} />
            <CategoryCard industry="SPA_MASSAGE" index={2} />
          </div>
        </div>
      </section>

      {/* ============ FEATURED BUSINESSES SECTION ============ */}
      {businesses.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Những Dịch Vụ Nổi Bật
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Các nhà cung cấp dịch vụ được lựa chọn hàng đầu từ cộng đồng của chúng tôi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {businesses.slice(0, 8).map((business: any, index: number) => (
                <BusinessCardNew
                  key={business.id}
                  business={business}
                  index={index}
                  userLoggedIn={!!user}
                />
              ))}
            </div>

            {businesses.length > 8 && (
              <div className="text-center">
                <Link
                  href="/businesses"
                  className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 hover:shadow-lg transition-all"
                >
                  Xem Tất Cả ({businesses.length})
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============ BENEFITS SECTION ============ */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            Tại sao chọn BookingPro?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🔒',
                title: 'Thanh Toán Bảo Mật',
                description: 'Múi phương thức thanh toán với bảo mật ngân hàng'
              },
              {
                icon: '📱',
                title: 'Giao Diện Hiện Đại',
                description: 'Hoạt động hoàn hảo trên mọi thiết bị'
              },
              {
                icon: '⏰',
                title: 'Thông Báo Tức Thì',
                description: 'Cập nhật lịch làm việc & thanh toán ngay lập tức'
              },
              {
                icon: '📊',
                title: 'Phân Tích Chi Tiết',
                description: 'Theo dõi hiệu suất với báo cáo chi tiết'
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="rounded-lg p-6 bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:bg-slate-750 transition-all hover:shadow-lg"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-slate-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA SECTION ============ */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-indigo-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Tham gia hàng nghìn khách hàng đang sử dụng BookingPro để quản lý lịch hẹn hiệu quả.
          </p>
          {!user ? (
            <Link
              href="/auth/signup"
              className="inline-block px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:shadow-lg transition-all hover:bg-indigo-50"
            >
              Tạo Tài Khoản Miễn Phí
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:shadow-lg transition-all hover:bg-indigo-50"
            >
              Vào Dashboard
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
