import Link from 'next/link'
import { getAllUsers } from '@/lib/actions'

export default async function Home() {
  const result = await getAllUsers()
  const users = result.success ? result.users : []
  const totalBookings = users.reduce((sum: number, user: any) => sum + (user.bookings?.length || 0), 0)

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-focus text-white p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-2">📅 Booking App</h1>
          <p className="text-lg opacity-90">Quản lý booking và users dễ dàng</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-70">Tổng Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-70">Tổng Bookings</p>
                  <p className="text-3xl font-bold">{totalBookings}</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm opacity-70">Trung bình Bookings/User</p>
                  <p className="text-3xl font-bold">
                    {users.length > 0 ? (totalBookings / users.length).toFixed(1) : 0}
                  </p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/auth/login" className="card bg-base-100 shadow-lg hover:shadow-xl transition">
            <div className="card-body">
              <div className="card-title">🔐 Đăng Nhập</div>
              <p>Truy cập dashboard cá nhân</p>
            </div>
          </Link>

          <Link href="/auth/signup" className="card bg-base-100 shadow-lg hover:shadow-xl transition">
            <div className="card-body">
              <div className="card-title">✨ Đăng Ký</div>
              <p>Tạo tài khoản mới</p>
            </div>
          </Link>

          <Link href="/admin/users" className="card bg-base-100 shadow-lg hover:shadow-xl transition">
            <div className="card-body">
              <div className="card-title">⚙️ Quản Lý Users</div>
              <p>CRUD users, bookings</p>
            </div>
          </Link>
        </div>

        {/* Users List */}
        {users.length > 0 && (
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title mb-4">👥 Users ({users.length})</h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-200">
                      <th>Email</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 10).map((user: any) => (
                      <tr key={user.id}>
                        <td className="font-mono">{user.email}</td>
                        <td>{user.name || '-'}</td>
                        <td>
                          <span className={`badge ${user.role === 'admin' ? 'badge-error' : 'badge-primary'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.bookings?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length > 10 && (
                <p className="text-sm opacity-70 mt-4">... và {users.length - 10} users khác</p>
              )}
            </div>
          </div>
        )}

        {/* Bookings List */}
        {totalBookings > 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">📋 Bookings Mới Nhất ({totalBookings})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users
                  .flatMap((user: any) =>
                    (user.bookings || []).map((booking: any) => ({
                      ...booking,
                      userName: user.name || user.email,
                    }))
                  )
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 6)
                  .map((booking: any) => (
                    <div key={booking.id} className="border border-base-300 rounded-lg p-4">
                      <h3 className="font-bold text-lg">{booking.title}</h3>
                      <p className="text-sm opacity-70 mb-2">{booking.description}</p>
                      <div className="flex justify-between text-sm">
                        <span>👤 {booking.userName}</span>
                        <span>📅 {new Date(booking.date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
              </div>
              {totalBookings > 6 && (
                <p className="text-sm opacity-70 mt-4">... và {totalBookings - 6} bookings khác</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
