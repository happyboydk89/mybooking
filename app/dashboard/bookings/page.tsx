import { getUserFromRequest } from '@/lib/auth'
import { getUserBusinesses } from '@/lib/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import BookingDataTable, { type BookingRow } from '@/components/BookingDataTable'

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
  const businesses = businessResult.success ? (businessResult.businesses ?? []) : []

  const params = await searchParams
  const selectedBusinessId = params.business

  // Find selected business or use first one
  let selectedBusiness = businesses.find((b: any) => b.id === selectedBusinessId)
  if (!selectedBusiness && businesses.length > 0) {
    selectedBusiness = businesses[0]
  }

  const bookings = selectedBusiness
    ? await prisma.booking.findMany({
        where: {
          businessId: selectedBusiness.id,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          services: {
            include: {
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    : []

  const bookingRows: BookingRow[] = bookings.map((booking: any) => ({
    id: booking.id,
    customerName: booking.user.name || '',
    customerEmail: booking.user.email,
    serviceName: booking.services.map((bs: any) => bs.service.name).join(' + '),
    dateTimeLabel: `${booking.date.toLocaleDateString('vi-VN')} • ${
      booking.timeSlot ||
      booking.date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }`,
    status: booking.status,
    payment: booking.paymentStatus === 'SUCCESS' ? 'PAID' : 'UNPAID',
  }))

  if (businesses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 border border-slate-200">
        <h1 className="text-3xl font-bold mb-4">📅 Quản Lý Lịch Hẹn</h1>
        <p className="text-slate-600 mb-6">Bạn cần tạo một doanh nghiệp trước khi có thể quản lý lịch hẹn.</p>
        <Link href="/dashboard" className="btn btn-primary">
          Quay Lại Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">📅 Quản Lý Lịch Hẹn</h1>
          {selectedBusiness && (
            <p className="text-slate-600 mt-2">{selectedBusiness.name}</p>
          )}
        </div>
        <Link href="/dashboard" className="btn btn-outline gap-2">
          ← Quay Lại
        </Link>
      </div>

      {/* Business Selector Tabs */}
      {businesses.length > 1 && (
        <div className="flex gap-2 flex-wrap">
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
        </div>
      )}

      {/* Content */}
      {selectedBusiness ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <BookingDataTable initialRows={bookingRows} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-lg text-slate-600">📭 Vui lòng chọn một doanh nghiệp</p>
        </div>
      )}
    </div>
  )
}
