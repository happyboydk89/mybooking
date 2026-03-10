'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { createBooking, createBookingWithPayment } from '@/lib/actions'
import { MapPin } from 'lucide-react'

interface Service {
  id: string
  name: string
  description?: string | null
  price: number
  duration: number
  requiresPayment?: boolean
}

interface Availability {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  isActive: boolean
}

interface BookingWidgetProps {
  businessId: string
  userId: string
  services: Service[]
  availabilities: Availability[]
  businessName: string
}

export default function BookingWidget({
  businessId,
  userId,
  services,
  availabilities,
  businessName,
}: BookingWidgetProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Get day of week from date
  const getDayOfWeek = (date: Date): string => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    return days[date.getDay()]
  }

  // Generate time slots for a given day
  const generateTimeSlots = (date: Date): string[] => {
    const dayOfWeek = getDayOfWeek(date)
    const availability = availabilities.find((a) => a.dayOfWeek === dayOfWeek)

    if (!availability || !availability.isActive) return []

    const slots: string[] = []
    const [startHour, startMin] = availability.startTime.split(':').map(Number)
    const [endHour, endMin] = availability.endTime.split(':').map(Number)

    let currentHour = startHour
    let currentMin = startMin

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`)
      currentMin += selectedService?.duration || 60
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60)
        currentMin = currentMin % 60
      }
    }

    return slots
  }

  const timeSlots = useMemo(() => {
    return selectedDate ? generateTimeSlots(selectedDate) : []
  }, [selectedDate, selectedService])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !userId || !businessId) {
      alert('Please select service, date, and time')
      return
    }

    setLoading(true)
    try {
      if (selectedService.requiresPayment) {
        const result = await createBookingWithPayment(
          userId,
          businessId,
          selectedService.id,
          new Date(selectedDate),
          selectedTime,
          'ZALOPAY'
        )

        if (result.success && result.booking) {
          // Initiate payment
          const paymentResponse = await fetch('/api/payments/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: result.booking.id,
              paymentProvider: 'ZALOPAY',
            }),
          })

          if (!paymentResponse.ok) throw new Error('Payment initiation failed')

          const paymentData = await paymentResponse.json()
          if (paymentData.success && paymentData.paymentUrl) {
            window.location.href = paymentData.paymentUrl
          } else {
            throw new Error(paymentData.error || 'Failed to get payment URL')
          }
        } else {
          alert('Failed to create booking: ' + result.error)
        }
      } else {
        const result = await createBooking(
          userId,
          businessId,
          selectedService.id,
          new Date(selectedDate),
          selectedTime
        )

        if (result.success) {
          setBookingSuccess(true)
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        } else {
          alert('Failed to create booking: ' + result.error)
        }
      }
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const isReadyToBook =
    selectedService && selectedDate && selectedTime

  return (
    <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-slate-900">Đặt lịch</h3>
        <p className="text-sm text-slate-500 mt-1">{businessName}</p>
      </div>

      {bookingSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="alert alert-success"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>Đặt lịch thành công! Chuyển hướng...</span>
        </motion.div>
      )}

      {/* Service Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">
          Chọn dịch vụ
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {services.map((service) => (
            <motion.button
              key={service.id}
              onClick={() => {
                setSelectedService(service)
                setSelectedDate(null)
                setSelectedTime(null)
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-3 rounded-lg text-left transition-all border-2 ${
                selectedService?.id === service.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-900">{service.name}</p>
                  <p className="text-xs text-slate-500">{service.duration} phút</p>
                </div>
                <p className="font-bold text-indigo-600">${service.price}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      {selectedService && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Chọn ngày
          </label>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
            <Calendar
              onChange={(date) => handleDateSelect(date as Date)}
              minDate={new Date()}
              className="w-full"
              locale="vi"
            />
          </div>
        </motion.div>
      )}

      {/* Time Slot Selection */}
      <AnimatePresence>
        {selectedDate && selectedService && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Chọn giờ
            </label>
            {timeSlots.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                Không có khung thời gian khả dụng cho ngày này
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <motion.button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`py-2 px-2 rounded-lg font-semibold text-sm transition-all border-2 ${
                      selectedTime === time
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    {time}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Summary */}
      {selectedService && selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-2 text-sm"
        >
          <div className="flex justify-between">
            <span className="text-slate-600">Dịch vụ:</span>
            <span className="font-semibold text-slate-900">{selectedService.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Ngày:</span>
            <span className="font-semibold text-slate-900">
              {selectedDate.toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Giờ:</span>
            <span className="font-semibold text-slate-900">{selectedTime}</span>
          </div>
          <div className="border-t border-indigo-200 pt-2 mt-2 flex justify-between">
            <span className="text-slate-600">Tổng:</span>
            <span className="font-bold text-indigo-600">${selectedService.price}</span>
          </div>
        </motion.div>
      )}

      {/* Book Button */}
      <motion.button
        onClick={handleConfirmBooking}
        disabled={!isReadyToBook || loading}
        whileHover={{ scale: isReadyToBook ? 1.02 : 1 }}
        whileTap={{ scale: isReadyToBook ? 0.98 : 1 }}
        className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${
          isReadyToBook
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:shadow-lg cursor-pointer'
            : 'bg-slate-300 cursor-not-allowed'
        }`}
      >
        {loading ? 'Đang xử lý...' : isReadyToBook ? 'Đặt lịch' : 'Vui lòng chọn đủ thông tin'}
      </motion.button>

      {selectedService?.requiresPayment && (
        <p className="text-xs text-slate-500 text-center">
          🔒 Dịch vụ này yêu cầu thanh toán trực tuyến
        </p>
      )}
    </div>
  )
}
