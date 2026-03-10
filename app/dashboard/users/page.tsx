import { getCustomersForProvider } from '@/lib/actions'
import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const user = await getUserFromRequest()
  if (!user) {
    redirect('/auth/login')
  }

  const result = await getCustomersForProvider(user.id)
  const customers = result.success ? result.customers : []

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Người Dùng Đã Đặt Lịch</h1>
        <p className="text-gray-600">
          Danh sách người dùng duy nhất đã từng đặt lịch tại các business của bạn.
        </p>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Danh sách người dùng không trùng ({customers.length})</h2>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Ten</th>
                  <th>So Lan Dat</th>
                  <th>Business Da Dat</th>
                  <th>Booking Gan Nhat</th>
                  <th>Trang Thai Gan Nhat</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center">
                      Chưa có người dùng nào đặt lịch cho business của bạn.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer: any) => {
                    const latestBooking = customer.bookings?.[0]
                    const businessNames = Array.from(
                      new Set((customer.bookings || []).map((booking: any) => booking.business?.name))
                    ).filter(Boolean)

                    return (
                      <tr key={customer.id}>
                        <td>{customer.email}</td>
                        <td>{customer.name || '-'}</td>
                        <td>{customer.bookings?.length || 0}</td>
                        <td>{businessNames.length > 0 ? businessNames.join(', ') : '-'}</td>
                        <td>
                          {latestBooking
                            ? new Date(latestBooking.date).toLocaleDateString('vi-VN')
                            : '-'}
                        </td>
                        <td>
                          {latestBooking ? (
                            <span
                              className={`badge ${
                                latestBooking.status === 'CONFIRMED'
                                  ? 'badge-success'
                                  : latestBooking.status === 'PENDING'
                                    ? 'badge-warning'
                                    : 'badge-error'
                              }`}
                            >
                              {latestBooking.status}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}