'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase-client'
import { EmptyBookings } from '@/components/EmptyBookings'
import { BookingListSkeleton } from '@/components/Skeleton'
import { useRouter } from 'next/navigation'

interface Booking {
  id: string
  date: string
  timeSlot: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  service?: {
    name: string
    price: number
    duration: number
  }
  business?: {
    name: string
    address?: string
  }
  [key: string]: any
}

export default function CustomerBookingsList({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  const router = useRouter()

  // Subscribe to realtime booking updates
  useEffect(() => {
    // Initial load
    const loadBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          date,
          timeSlot,
          status,
          service:serviceId(name, price, duration),
          business:businessId(name, address)
        `)
        .eq('userId', userId)
        .order('date', { ascending: true })

      if (!error && data) {
        // Transform nested arrays to single objects
        const transformed = (data as any[]).map((booking: any) => ({
          id: booking.id,
          date: booking.date,
          timeSlot: booking.timeSlot,
          status: booking.status,
          service: Array.isArray(booking.service) ? booking.service[0] : booking.service,
          business: Array.isArray(booking.business) ? booking.business[0] : booking.business,
        }))
        setBookings(transformed)
      }
      setLoading(false)
    }

    loadBookings()

    // Subscribe to updates
    const subscription = supabase
      .channel(`user-bookings-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setBookings((prev) => prev.filter((b) => b.id !== payload.old.id))
          } else if (payload.eventType === 'INSERT') {
            const newBooking = {
              id: payload.new.id,
              date: payload.new.date,
              timeSlot: payload.new.timeSlot,
              status: payload.new.status,
              service: payload.new.service,
              business: payload.new.business,
            }
            setBookings((prev) =>
              [...prev, newBooking].sort((a, b) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
              )
            )
          } else if (payload.eventType === 'UPDATE') {
            setBookings((prev) =>
              prev.map((b) =>
                b.id === payload.new.id
                  ? {
                      ...b,
                      status: payload.new.status,
                      date: payload.new.date,
                      timeSlot: payload.new.timeSlot,
                    }
                  : b
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  if (loading) {
    return <BookingListSkeleton />
  }

  if (bookings.length === 0) {
    return (
      <EmptyBookings
        title="Chưa có lịch hẹn"
        description="Bạn chưa có lịch hẹn nào. Hãy bắt đầu bằng cách tìm và đặt lịch với các doanh nghiệp yêu thích."
        onAction={() => router.push('/')}
        actionLabel="Khám phá dịch vụ"
      />
    )
  }

  const now = new Date()
  const upcomingBookings = bookings.filter((b) => new Date(b.date) >= now)
  const pastBookings = bookings.filter((b) => new Date(b.date) < now)

  const getBookingsByStatus = (items: Booking[]) => ({
    pending: items.filter((b) => b.status === 'PENDING'),
    confirmed: items.filter((b) => b.status === 'CONFIRMED'),
    cancelled: items.filter((b) => b.status === 'CANCELLED'),
  })

  const upcomingStatusBookings = getBookingsByStatus(upcomingBookings)
  const pastStatusBookings = getBookingsByStatus(pastBookings)
  const displayBookings = activeTab === 'upcoming' ? upcomingStatusBookings : pastStatusBookings
  const displayList = activeTab === 'upcoming' ? upcomingBookings : pastBookings

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📅 Sắp Tới ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'past'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ⏳ Lịch Sử ({pastBookings.length})
        </button>
      </div>

      {/* Content based on selected tab */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {displayList.length === 0 ? (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center py-8">
              <p className="text-lg text-gray-600">
                {activeTab === 'upcoming' ? 'Chưa có lịch hẹn sắp tới' : 'Không có lịch hẹn cũ'}
              </p>
              <p className="text-sm text-gray-500">
                {activeTab === 'upcoming' ? 'Hãy đặt ngay một lịch hẹn từ trang home' : 'Bạn chưa có lịch hẹn nào trong quá khứ'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Confirmed Bookings */}
            {displayBookings.confirmed.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="badge badge-success">✓ Đã Xác Nhận</span>
                  <span className="text-gray-600">({displayBookings.confirmed.length})</span>
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {displayBookings.confirmed.map((booking) => (
                    <CustomerBookingCard 
                      key={booking.id} 
                      booking={booking} 
                      isPast={activeTab === 'past'}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Pending Bookings */}
            {displayBookings.pending.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="badge badge-warning">⏳ Chờ Xác Nhận</span>
                  <span className="text-gray-600">({displayBookings.pending.length})</span>
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {displayBookings.pending.map((booking) => (
                    <CustomerBookingCard 
                      key={booking.id} 
                      booking={booking}
                      isPast={activeTab === 'past'}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Cancelled Bookings */}
            {displayBookings.cancelled.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="badge badge-error">✗ Đã Hủy</span>
                  <span className="text-gray-600">({displayBookings.cancelled.length})</span>
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {displayBookings.cancelled.map((booking) => (
                    <CustomerBookingCard 
                      key={booking.id} 
                      booking={booking}
                      isPast={activeTab === 'past'}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function CustomerBookingCard({ booking, isPast = false }: { booking: Booking; isPast?: boolean }) {
  const bookingDate = new Date(booking.date)
  const dateDisplay = bookingDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const statusConfig = {
    PENDING: { badge: 'badge-warning', text: 'Chờ Xác Nhận', icon: '⏳' },
    CONFIRMED: { badge: 'badge-success', text: 'Đã Xác Nhận', icon: '✓' },
    CANCELLED: { badge: 'badge-error', text: 'Đã Hủy', icon: '✗' },
  }

  const status = statusConfig[booking.status]

  let cardBackgroundClass = ''
  if (isPast) {
    cardBackgroundClass = 'bg-gray-50 opacity-75'
  } else {
    if (booking.status === 'CANCELLED') {
      cardBackgroundClass = 'bg-gray-100 opacity-70'
    } else if (booking.status === 'CONFIRMED') {
      cardBackgroundClass = 'bg-green-50 border-2 border-green-200'
    } else {
      cardBackgroundClass = 'bg-yellow-50 border-2 border-yellow-200'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`card shadow-lg ${cardBackgroundClass}`}
    >
      <div className="card-body">
        {isPast && (
          <div className="py-2 px-3 mb-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold">
            ⏱️ Đã Hoàn Thành
          </div>
        )}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="card-title">
              {booking.service?.name || 'Service'} @ {booking.business?.name || 'Business'}
            </h3>
            {booking.business?.address && (
              <p className="text-sm text-gray-600">📍 {booking.business.address}</p>
            )}
          </div>
          <span className={`badge ${status.badge}`}>
            {status.icon} {status.text}
          </span>
        </div>

        <div className="divider my-2"></div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="opacity-70">📅 Ngày</p>
            <p className="font-semibold">{dateDisplay}</p>
          </div>
          <div>
            <p className="opacity-70">⏰ Giờ</p>
            <p className="font-semibold">{booking.timeSlot}</p>
          </div>
          <div>
            <p className="opacity-70">💰 Giá</p>
            <p className="font-semibold text-blue-600">${booking.service?.price || 0}</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Thời lượng: {booking.service?.duration || 0} phút
        </p>
      </div>
    </motion.div>
  )
}
