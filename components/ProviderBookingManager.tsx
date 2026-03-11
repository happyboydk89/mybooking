'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateBookingStatus, getBookingsForBusiness, getBookingById } from '@/lib/actions'
import { subscribeToBookings } from '@/lib/supabase-client'
import { Calendar, Clock, User, DollarSign, Eye, X, CheckCircle, XCircle, Package } from 'lucide-react'
import { EmptyState } from '@/components/EmptyState'
import { BookingListSkeleton, DashboardCardSkeleton } from '@/components/Skeleton'
import { showToast } from '@/lib/toast'

interface Booking {
  id: string
  date: Date
  timeSlot: string | null
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  user: {
    id: string
    name?: string
    email: string
    phone?: string
  }
  services: Array<{
    id: string
    createdAt: Date
    bookingId: string
    serviceId: string
    service: {
      id: string
      name: string
      price: number
      duration: number
    }
  }>
  notes?: string
}

type FilterType = 'all' | 'day' | 'week' | 'month'
type ViewType = 'card' | 'table'

export default function ProviderBookingManager({ businessId }: { businessId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewType, setViewType] = useState<ViewType>('card')
  const [updating, setUpdating] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Initial load
  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true)
      const result = await getBookingsForBusiness(businessId, filterType, selectedDate)
      if (result.success && result.bookings) {
        setBookings(result.bookings as Booking[])
      }
      setLoading(false)
    }

    loadBookings()
  }, [businessId, filterType, selectedDate])

  // Subscribe to realtime updates
  useEffect(() => {
    const subscription = subscribeToBookings(businessId, (newBooking: Booking) => {
      setBookings((prev) => {
        const index = prev.findIndex((b) => b.id === newBooking.id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = newBooking
          return updated
        } else {
          return [newBooking, ...prev]
        }
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [businessId])

  const handleUpdateStatus = async (
    bookingId: string,
    status: 'CONFIRMED' | 'CANCELLED'
  ) => {
    setUpdating(bookingId)
    const result = await updateBookingStatus(bookingId, status)
    if (result.success) {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      )
      if (status === 'CONFIRMED') {
        showToast.success('Lịch hẹn đã xác nhận', 'Khách hàng sẽ nhận được thông báo')
      } else if (status === 'CANCELLED') {
        showToast.warning('Lịch hẹn đã hủy', 'Khách hàng sẽ được thông báo')
      }
    } else {
      showToast.error('Cập nhật thất bại', 'Vui lòng thử lại')
    }
    setUpdating(null)
  }

  const handleViewDetails = async (booking: Booking) => {
    setSelectedBooking(booking)
    setDetailsOpen(true)
  }

  // Count bookings by status
  const todayBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.date)
    const today = new Date()
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    )
  })

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'badge-warning'
      case 'CONFIRMED':
        return 'badge-success'
      case 'CANCELLED':
        return 'badge-error'
      default:
        return 'badge-info'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ Xác Nhận'
      case 'CONFIRMED':
        return 'Đã Xác Nhận'
      case 'CANCELLED':
        return 'Đã Hủy'
      default:
        return status
    }
  }

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'badge-warning'
      case 'SUCCESS':
        return 'badge-success'
      case 'FAILED':
        return 'badge-error'
      case 'CANCELLED':
        return 'badge-error'
      default:
        return 'badge-info'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ Thanh Toán'
      case 'SUCCESS':
        return 'Đã Thanh Toán'
      case 'FAILED':
        return 'Thanh Toán Thất Bại'
      case 'CANCELLED':
        return 'Bị Hủy'
      default:
        return status
    }
  }

  const formatDate = (dateStr: string, includeTime = true) => {
    const date = new Date(dateStr)
    const formatted = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    return includeTime ? `${formatted}` : formatted
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <StatCard
          icon="📅"
          label="Hôm Nay"
          value={todayBookings.length}
          color="bg-blue-50"
        />
        <StatCard
          icon="⏳"
          label="Chờ Xác Nhận"
          value={pendingCount}
          color="bg-yellow-50"
        />
        <StatCard
          icon="✅"
          label="Đã Xác Nhận"
          value={confirmedCount}
          color="bg-green-50"
        />
        <StatCard
          icon="💰"
          label="Tổng Doanh Thu"
          value={`${bookings
            .filter((b) => b.status === 'CONFIRMED' && b.paymentStatus === 'SUCCESS')
            .reduce((sum, b) => sum + b.services.reduce((serviceSum, bs) => serviceSum + bs.service.price, 0), 0)
            .toLocaleString('vi-VN')}₫`}
          color="bg-purple-50"
          isPrice
        />
      </motion.div>

      {/* Filter & View Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-sm p-4 border border-slate-200"
      >
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filterType === 'all'}
              onClick={() => {
                setFilterType('all')
              }}
              label="Tất Cả"
            />
            <FilterButton
              active={filterType === 'day'}
              onClick={() => {
                setFilterType('day')
                setSelectedDate(new Date())
              }}
              label="Hôm Nay"
            />
            <FilterButton
              active={filterType === 'week'}
              onClick={() => setFilterType('week')}
              label="Tuần Này"
            />
            <FilterButton
              active={filterType === 'month'}
              onClick={() => setFilterType('month')}
              label="Tháng Này"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 border border-slate-300 rounded-lg p-1">
            <button
              onClick={() => setViewType('card')}
              className={`px-3 py-1 rounded transition-colors ${
                viewType === 'card'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📋 Thẻ
            </button>
            <button
              onClick={() => setViewType('table')}
              className={`px-3 py-1 rounded transition-colors ${
                viewType === 'table'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              📊 Bảng
            </button>
          </div>
        </div>

        {/* Date Picker for Day Filter */}
        {filterType === 'day' && (
          <div className="mt-4">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="input input-bordered input-sm max-w-xs"
            />
          </div>
        )}
      </motion.div>

      {/* Bookings List/Table */}
      {loading ? (
        viewType === 'card' ? <BookingListSkeleton /> : <BookingListSkeleton />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<Package className="w-10 h-10 text-slate-600" />}
          title="Chưa có lịch hẹn"
          description="Bạn chưa có lịch hẹn nào trong khoảng thời gian này. Hệ thống sẽ hiển thị lịch hẹn tại đây khi khách hàng đặt."
          gradient="from-slate-600 to-slate-700"
          bgGradient="from-slate-100 to-slate-100"
        />
      ) : viewType === 'card' ? (
        <div className="space-y-6">
          <CardView
            bookings={bookings}
            onConfirm={handleUpdateStatus}
            onCancel={handleUpdateStatus}
            onViewDetails={handleViewDetails}
            updating={updating}
            getStatusBadgeColor={getStatusBadgeColor}
            getStatusText={getStatusText}
            getPaymentStatusBadgeColor={getPaymentStatusBadgeColor}
            getPaymentStatusText={getPaymentStatusText}
            formatDate={formatDate}
          />
        </div>
      ) : (
        <TableView
          bookings={bookings}
          onConfirm={handleUpdateStatus}
          onCancel={handleUpdateStatus}
          onViewDetails={handleViewDetails}
          updating={updating}
          getStatusBadgeColor={getStatusBadgeColor}
          getStatusText={getStatusText}
          getPaymentStatusBadgeColor={getPaymentStatusBadgeColor}
          getPaymentStatusText={getPaymentStatusText}
          formatDate={formatDate}
        />
      )}

      {/* Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        getStatusText={getStatusText}
        getPaymentStatusText={getPaymentStatusText}
        formatDate={formatDate}
      />
    </div>
  )
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
  isPrice = false,
}: {
  icon: string
  label: string
  value: number | string
  color: string
  isPrice?: boolean
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`${color} rounded-lg shadow-sm p-4 border border-slate-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${isPrice ? 'text-purple-600' : 'text-blue-600'}`}>
            {value}
          </p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </motion.div>
  )
}

// Filter Button Component
function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        active
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  )
}

// Card View Component
function CardView({
  bookings,
  onConfirm,
  onCancel,
  onViewDetails,
  updating,
  getStatusBadgeColor,
  getStatusText,
  getPaymentStatusBadgeColor,
  getPaymentStatusText,
  formatDate,
}: any) {
  // Group by status
  const pending = bookings.filter((b: Booking) => b.status === 'PENDING')
  const confirmed = bookings.filter((b: Booking) => b.status === 'CONFIRMED')
  const cancelled = bookings.filter((b: Booking) => b.status === 'CANCELLED')

  return (
    <>
      {pending.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="badge badge-warning">⏳ Chờ Xác Nhận</span>
            <span className="text-slate-600">({pending.length})</span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {pending.map((booking: Booking) => (
              <BookingCardItem
                key={booking.id}
                booking={booking}
                onConfirm={() => onConfirm(booking.id, 'CONFIRMED')}
                onCancel={() => onCancel(booking.id, 'CANCELLED')}
                onViewDetails={() => onViewDetails(booking)}
                updating={updating === booking.id}
                getStatusBadgeColor={getStatusBadgeColor}
                getStatusText={getStatusText}
                getPaymentStatusBadgeColor={getPaymentStatusBadgeColor}
                getPaymentStatusText={getPaymentStatusText}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}

      {confirmed.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="badge badge-success">✅ Đã Xác Nhận</span>
            <span className="text-slate-600">({confirmed.length})</span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {confirmed.map((booking: Booking) => (
              <BookingCardItem
                key={booking.id}
                booking={booking}
                onViewDetails={() => onViewDetails(booking)}
                updating={false}
                getStatusBadgeColor={getStatusBadgeColor}
                getStatusText={getStatusText}
                getPaymentStatusBadgeColor={getPaymentStatusBadgeColor}
                getPaymentStatusText={getPaymentStatusText}
                formatDate={formatDate}
                isConfirmed
              />
            ))}
          </div>
        </div>
      )}

      {cancelled.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="badge badge-error">❌ Đã Hủy</span>
            <span className="text-slate-600">({cancelled.length})</span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {cancelled.map((booking: Booking) => (
              <BookingCardItem
                key={booking.id}
                booking={booking}
                onViewDetails={() => onViewDetails(booking)}
                updating={false}
                getStatusBadgeColor={getStatusBadgeColor}
                getStatusText={getStatusText}
                getPaymentStatusBadgeColor={getPaymentStatusBadgeColor}
                getPaymentStatusText={getPaymentStatusText}
                formatDate={formatDate}
                isCancelled
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Booking Card Item Component
function BookingCardItem({
  booking,
  onConfirm,
  onCancel,
  onViewDetails,
  updating,
  getStatusBadgeColor,
  getStatusText,
  getPaymentStatusBadgeColor,
  getPaymentStatusText,
  formatDate,
  isConfirmed,
  isCancelled,
}: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`bg-white rounded-lg shadow-sm border-l-4 border-slate-200 overflow-hidden transition-all ${
        isCancelled
          ? 'bg-slate-50 opacity-75'
          : isConfirmed
            ? 'border-l-green-500'
            : 'border-l-yellow-500'
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-900">{booking.services.map((bs: any) => bs.service.name).join(' + ')}</h3>
            <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
              <User size={14} /> {booking.user.name || booking.user.email}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-indigo-600">{booking.services.reduce((sum: number, bs: any) => sum + bs.service.price, 0).toLocaleString('vi-VN')}₫</p>
            <p className="text-xs text-slate-500">{Math.max(...booking.services.map((bs: any) => bs.service.duration))} phút</p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className={`badge ${getStatusBadgeColor(booking.status)}`}>
            {getStatusText(booking.status)}
          </span>
          <span className={`badge ${getPaymentStatusBadgeColor(booking.paymentStatus)}`}>
            {getPaymentStatusText(booking.paymentStatus)}
          </span>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar size={16} />
            {formatDate(booking.date, false)}
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Clock size={16} />
            {booking.timeSlot}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-slate-200">
          <button
            onClick={onViewDetails}
            className="flex-1 btn btn-sm btn-ghost gap-2"
          >
            <Eye size={16} /> Chi Tiết
          </button>
          {!isConfirmed && !isCancelled && (
            <>
              <button
                onClick={onCancel}
                disabled={updating}
                className="btn btn-sm btn-outline btn-error gap-2"
              >
                {updating ? <span className="loading loading-spinner loading-xs"></span> : <X size={16} />}
                Hủy
              </button>
              <button
                onClick={onConfirm}
                disabled={updating}
                className="btn btn-sm btn-success gap-2"
              >
                {updating ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <CheckCircle size={16} />
                )}
                Xác Nhận
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Table View Component
function TableView({
  bookings,
  onConfirm,
  onCancel,
  onViewDetails,
  updating,
  getStatusBadgeColor,
  getStatusText,
  getPaymentStatusBadgeColor,
  getPaymentStatusText,
  formatDate,
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200"
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Khách Hàng</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Dịch Vụ</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày & Giờ</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Giá</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng Thái</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thanh Toán</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking: Booking, index: number) => (
            <motion.tr
              key={booking.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                booking.status === 'CANCELLED' ? 'opacity-50' : ''
              }`}
            >
              <td className="px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{booking.user.name || booking.user.email}</p>
                  <p className="text-xs text-slate-500">{booking.user.email}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">{booking.services.map((bs: any) => bs.service.name).join(' + ')}</td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {formatDate(booking.date, false)} <br />
                <span className="text-xs text-slate-500">{booking.timeSlot}</span>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                {booking.services.reduce((sum: number, bs: any) => sum + bs.service.price, 0).toLocaleString('vi-VN')}₫
              </td>
              <td className="px-4 py-3 text-sm">
                <span className={`badge ${getStatusBadgeColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <span className={`badge ${getPaymentStatusBadgeColor(booking.paymentStatus)}`}>
                  {getPaymentStatusText(booking.paymentStatus)}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm space-x-1">
                <button
                  onClick={() => onViewDetails(booking)}
                  className="btn btn-xs btn-ghost"
                  title="Xem chi tiết"
                >
                  <Eye size={14} />
                </button>
                {booking.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => onCancel(booking.id, 'CANCELLED')}
                      disabled={updating === booking.id}
                      className="btn btn-xs btn-outline btn-error"
                      title="Hủy"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={() => onConfirm(booking.id, 'CONFIRMED')}
                      disabled={updating === booking.id}
                      className="btn btn-xs btn-success"
                      title="Xác nhận"
                    >
                      <CheckCircle size={14} />
                    </button>
                  </>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}

// Booking Details Modal Component
function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  getStatusText,
  getPaymentStatusText,
  formatDate,
}: any) {
  if (!booking || !isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Chi Tiết Lịch Hẹn</h2>
          <button onClick={onClose} className="btn btn-circle btn-ghost text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Service & Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Dịch Vụ</h3>
              <p className="text-lg font-bold text-slate-900">{booking.services.map((bs: any) => bs.service.name).join(' + ')}</p>
              <p className="text-sm text-slate-600 mt-1">{Math.max(...booking.services.map((bs: any) => bs.service.duration))} phút</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Khách Hàng</h3>
              <p className="text-lg font-bold text-slate-900">{booking.user.name || booking.user.email}</p>
              <p className="text-sm text-slate-600 mt-1">{booking.user.email}</p>
              {booking.user.phone && (
                <p className="text-sm text-slate-600">{booking.user.phone}</p>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                <Calendar size={16} /> Ngày
              </h3>
              <p className="text-lg font-bold text-slate-900">{formatDate(booking.date, false)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
                <Clock size={16} /> Giờ
              </h3>
              <p className="text-lg font-bold text-slate-900">{booking.timeSlot}</p>
            </div>
          </div>

          {/* Status & Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Trạng Thái</h3>
              <p className="text-lg font-bold text-slate-900">{getStatusText(booking.status)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Thanh Toán</h3>
              <p className="text-lg font-bold text-slate-900">{getPaymentStatusText(booking.paymentStatus)}</p>
            </div>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              <DollarSign size={16} /> Giá
            </h3>
            <p className="text-3xl font-bold text-indigo-600">
              {booking.services.reduce((sum: number, bs: any) => sum + bs.service.price, 0).toLocaleString('vi-VN')}₫
            </p>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-600 mb-2">Ghi Chú</h3>
              <p className="text-slate-700">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-outline">
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
