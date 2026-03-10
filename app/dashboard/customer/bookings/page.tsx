import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CustomerBookingsList from '@/components/CustomerBookingsList'
import Link from 'next/link'

export default async function CustomerBookingsPage() {
  const user = await getUserFromRequest()
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">📅 Lịch Hẹn Của Bạn</h1>
          <p className="text-gray-600">Xem và quản lý tất cả các lịch hẹn (Cập nhật realtime)</p>
        </div>
        <Link href="/dashboard" className="btn btn-outline">
          ← Quay Lại Dashboard
        </Link>
      </div>

      <CustomerBookingsList userId={user.id} />
    </div>
  )
}
