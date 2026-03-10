import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

function formatVnd(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function statusBadgeClasses(status: BookingStatus) {
  if (status === 'CONFIRMED') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }

  if (status === 'PENDING') {
    return 'bg-amber-100 text-amber-700 border-amber-200'
  }

  return 'bg-rose-100 text-rose-700 border-rose-200'
}

function statusLabel(status: BookingStatus) {
  if (status === 'CONFIRMED') {
    return 'Confirmed'
  }

  if (status === 'PENDING') {
    return 'Pending'
  }

  return 'Cancelled'
}

function relativeTimeLabel(date: Date) {
  const now = new Date().getTime()
  const target = new Date(date).getTime()
  const diffMs = target - now
  const hours = Math.floor(diffMs / (1000 * 60 * 60))

  if (hours < 24) {
    return `Con ${Math.max(hours, 0)} gio`
  }

  const days = Math.floor(hours / 24)
  return `Con ${days} ngay`
}

export default async function BookHistoryPage() {
  const user = await getUserFromRequest()

  if (!user) {
    redirect('/auth/login')
  }

  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
    },
    include: {
      business: {
        select: {
          id: true,
          name: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  const now = new Date()
  const upcomingBookings = bookings
    .filter((booking: any) => booking.status !== 'CANCELLED' && new Date(booking.date) >= now)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4)

  const historyBookings = bookings
    .filter((booking: any) => new Date(booking.date) < now)
    .slice(0, 10)

  const totalSpent = bookings
    .filter((booking: any) => booking.status === 'CONFIRMED')
    .reduce((sum: number, booking: any) => sum + booking.service.price, 0)

  const totalBookings = bookings.length

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-cyan-700 to-blue-800 p-6 text-white shadow-xl md:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-100">Book History</p>
        <h1 className="mt-2 text-2xl font-bold md:text-3xl">Xin chao, {user.name || user.email}</h1>
        <p className="mt-2 text-sm text-cyan-100 md:text-base">
          Theo doi lich hen sap toi, xem lai lich su va dat lich nhanh chi trong vai buoc.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Upcoming Bookings</h2>
            <Link href="/dashboard/book-history" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Xem tat ca
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              Ban chua co lich hen sap toi.
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking: any) => (
                <div key={booking.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{booking.service.name}</p>
                      <p className="text-sm text-slate-500">{booking.business.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {new Date(booking.date).toLocaleDateString('vi-VN')} • {booking.timeSlot || 'Chua chon gio'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {relativeTimeLabel(new Date(booking.date))}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClasses(booking.status)}`}>
                        {statusLabel(booking.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-4">
          <h2 className="text-xl font-semibold text-slate-900">Profile Card</h2>
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Nguoi dung</p>
            <p className="text-lg font-semibold text-slate-900">{user.name || 'Nguoi dung'}</p>
            <p className="text-sm text-slate-600">{user.email}</p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Tong so tien da chi tieu</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{formatVnd(totalSpent)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">So lan da dat lich</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{totalBookings}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Booking History</h2>
          <Link href="/search" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Tim dich vu moi
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="px-2 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Dich vu</th>
                <th className="px-2 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Business</th>
                <th className="px-2 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Ngay gio</th>
                <th className="px-2 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Gia</th>
                <th className="px-2 py-3 text-left text-xs uppercase tracking-wide text-slate-500">Trang thai</th>
                <th className="px-2 py-3 text-right text-xs uppercase tracking-wide text-slate-500">Re-book</th>
              </tr>
            </thead>
            <tbody>
              {historyBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center text-sm text-slate-500">
                    Chua co lich su dat lich.
                  </td>
                </tr>
              )}

              {historyBookings.map((booking: any) => (
                <tr key={booking.id} className="border-b border-slate-100">
                  <td className="px-2 py-3 text-sm font-medium text-slate-900">{booking.service.name}</td>
                  <td className="px-2 py-3 text-sm text-slate-600">{booking.business.name}</td>
                  <td className="px-2 py-3 text-sm text-slate-600">
                    {new Date(booking.date).toLocaleDateString('vi-VN')} • {booking.timeSlot || '--:--'}
                  </td>
                  <td className="px-2 py-3 text-sm text-slate-600">{formatVnd(booking.service.price)}</td>
                  <td className="px-2 py-3">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses(booking.status)}`}>
                      {statusLabel(booking.status)}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <Link
                      href={`/business/${booking.business.id}`}
                      className="inline-flex rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      Dat lai
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
