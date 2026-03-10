'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateBookingStatus, getBookingsForBusiness } from '@/lib/actions'
import { subscribeToBookings } from '@/lib/supabase-client'
import BookingFilter from '@/components/BookingFilter'

interface Booking {
  id: string
  date: string
  timeSlot: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  user: {
    id: string
    name?: string
    email: string
  }
  service: {
    id: string
    name: string
    price: number
    duration: number
  }
}

type FilterType = 'all' | 'day' | 'week' | 'month'

export default function BookingManagementDashboard({ businessId }: { businessId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [updating, setUpdating] = useState<string | null>(null)

  // Initial load and filter change
  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true)
      const result = await getBookingsForBusiness(businessId, filterType, selectedDate)
      if (result.success) {
        setBookings(result.bookings as Booking[])
      }
      setLoading(false)
    }

    loadBookings()
  }, [businessId, filterType, selectedDate])

  // Subscribe to realtime updates
  useEffect(() => {
    const subscription = subscribeToBookings(businessId, (newBooking: Booking) => {
      // Update or add the booking
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
      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status }
            : booking
        )
      )
    }
    setUpdating(null)
  }

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING')
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED')
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED')

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <BookingFilter
        filterType={filterType}
        onFilterChange={setFilterType}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {loading ? (
        <div className="text-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center py-12">
            <p className="text-lg text-gray-600">Không có lịch hẹn nào</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Pending Bookings */}
          {pendingBookings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="badge badge-warning">Chờ Xác Nhận</span>
                <span className="text-gray-600 text-lg">({pendingBookings.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {pendingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onConfirm={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                    onCancel={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                    isUpdating={updating === booking.id}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Confirmed Bookings */}
          {confirmedBookings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="badge badge-success">Đã Xác Nhận</span>
                <span className="text-gray-600 text-lg">({confirmedBookings.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {confirmedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isConfirmed />
                ))}
              </div>
            </motion.div>
          )}

          {/* Cancelled Bookings */}
          {cancelledBookings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="badge badge-error">Đã Hủy</span>
                <span className="text-gray-600 text-lg">({cancelledBookings.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {cancelledBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isCancelled />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

// Booking Card Component
function BookingCard({
  booking,
  onConfirm,
  onCancel,
  isUpdating,
  isConfirmed,
  isCancelled,
}: {
  booking: Booking
  onConfirm?: () => void
  onCancel?: () => void
  isUpdating?: boolean
  isConfirmed?: boolean
  isCancelled?: boolean
}) {
  const bookingDate = new Date(booking.date)
  const dateDisplay = bookingDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`card shadow-lg ${
        isCancelled
          ? 'bg-gray-100 opacity-70'
          : isConfirmed
            ? 'bg-green-50 border-2 border-green-200'
            : 'bg-yellow-50 border-2 border-yellow-200'
      }`}
    >
      <div className="card-body">
        <div className="flex justify-between items-start mb-3">
          <div >
            <h3 className="card-title text-lg">{booking.service.name}</h3>
            <p className="text-sm text-gray-600">
              👤 {booking.user.name || booking.user.email}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-blue-600">${booking.service.price}</p>
            <p className="text-xs text-gray-500">{booking.service.duration} phút</p>
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="opacity-70">📅 Ngày</p>
            <p className="font-semibold">{dateDisplay}</p>
          </div>
          <div>
            <p className="opacity-70">⏰ Giờ</p>
            <p className="font-semibold">{booking.timeSlot}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isConfirmed && !isCancelled && (
          <div className="card-actions justify-end gap-2 mt-4">
            <button
              onClick={onCancel}
              disabled={isUpdating}
              className="btn btn-sm btn-outline btn-error"
            >
              {isUpdating ? <span className="loading loading-spinner"></span> : 'Hủy'}
            </button>
            <button
              onClick={onConfirm}
              disabled={isUpdating}
              className="btn btn-sm btn-success"
            >
              {isUpdating ? <span className="loading loading-spinner"></span> : 'Xác Nhận'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
