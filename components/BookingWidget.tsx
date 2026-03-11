'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { createBooking, createBookingWithPayment } from '@/lib/actions'
import { showToast } from '@/lib/toast'

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
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
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

    const totalDuration = selectedServices.length > 0 
      ? selectedServices.reduce((max, s) => Math.max(max, s.duration), 0)
      : 60

    let currentHour = startHour
    let currentMin = startMin

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`)
      currentMin += totalDuration
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60)
        currentMin = currentMin % 60
      }
    }

    return slots
  }

  const timeSlots = useMemo(() => {
    return selectedDate ? generateTimeSlots(selectedDate) : []
  }, [selectedDate, selectedServices])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const toggleService = (service: Service) => {
    setSelectedServices((prev) => {
      const isSelected = prev.some(s => s.id === service.id)
      if (isSelected) {
        return prev.filter(s => s.id !== service.id)
      } else {
        return [...prev, service]
      }
    })
    setSelectedDate(null)
    setSelectedTime(null)
  }

  const handleConfirmBooking = async () => {
    if (selectedServices.length === 0 || !selectedDate || !selectedTime || !userId || !businessId) {
      showToast.warning('Vui lòng chọn dịch vụ, ngày và giờ', 'Hoàn thành tất cả các bước để tiếp tục')
      return
    }

    setLoading(true)
    const loadingToast = showToast.loading('Đang xử lý đặt lịch...')
    
    try {
      const serviceIds = selectedServices.map(s => s.id)
      const requiresPayment = selectedServices.some(s => s.requiresPayment)

      if (requiresPayment) {
        const result = await createBookingWithPayment(
          userId,
          businessId,
          serviceIds,
          new Date(selectedDate),
          selectedTime,
          'ZALOPAY'
        )

        if (result.success && result.booking) {
          const paymentResponse = await fetch('/api/payments/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: result.booking.id,
              paymentProvider: 'ZALOPAY',
            }),
          })

          if (!paymentResponse.ok) {
            showToast.paymentError('Không thể khởi tạo thanh toán')
            throw new Error('Payment initiation failed')
          }

          const paymentData = await paymentResponse.json()
          if (paymentData.success && paymentData.paymentUrl) {
            showToast.dismiss(loadingToast)
            showToast.info('Đang chuyển hướng đến trang thanh toán...', 'Vui lòng đợi')
            setTimeout(() => {
              window.location.href = paymentData.paymentUrl
            }, 1000)
          } else {
            showToast.paymentError(paymentData.error)
            throw new Error(paymentData.error || 'Failed to get payment URL')
          }
        } else {
          showToast.bookingError(result.error)
        }
      } else {
        const result = await createBooking(
          userId,
          businessId,
          serviceIds,
          new Date(selectedDate),
          selectedTime
        )

        if (result.success) {
          showToast.dismiss(loadingToast)
          showToast.bookingSuccess(businessName, selectedServices.map(s => s.name).join(' + '))
          setBookingSuccess(true)
          setTimeout(() => {
            window.location.href = '/dashboard/book-history'
          }, 2000)
        } else {
          showToast.bookingError(result.error)
        }
      }
    } catch (error) {
      showToast.error('Lỗi', (error as Error).message)
    } finally {
      setLoading(false)
      showToast.dismiss(loadingToast)
    }
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const maxDuration = selectedServices.length > 0 
    ? selectedServices.reduce((max, s) => Math.max(max, s.duration), 0)
    : 0
  const isReadyToBook = selectedServices.length > 0 && selectedDate && selectedTime

  return (
    <div className="sticky top-24 bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
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

      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">
          Chọn dịch vụ <span className="text-xs text-slate-500">(có thể chọn nhiều)</span>
        </label>
        <div className="space-y-2">
          {services.map((service) => {
            const isSelected = selectedServices.some(s => s.id === service.id)
            return (
              <motion.button
                key={service.id}
                type="button"
                onClick={() => toggleService(service)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-3 rounded-lg text-left transition-all border-2 flex items-start gap-3 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isSelected 
                    ? 'bg-indigo-600 border-indigo-600' 
                    : 'border-slate-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{service.name}</p>
                  <p className="text-xs text-slate-500">{service.duration} phút</p>
                </div>
                <p className="font-bold text-indigo-600 flex-shrink-0">${service.price}</p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {selectedServices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="block text-sm font-semibold text-slate-900 mb-3">
            Chọn ngày
          </label>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <Calendar
              onChange={(date) => handleDateSelect(date as Date)}
              minDate={new Date()}
              className="w-full react-calendar"
              locale="vi"
            />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedDate && selectedServices.length > 0 && (
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
                    type="button"
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

      {selectedServices.length > 0 && selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-2 text-sm"
        >
          <div className="flex justify-between">
            <span className="text-slate-600">Dịch vụ:</span>
            <span className="font-semibold text-slate-900 text-right max-w-xs">
              {selectedServices.map(s => s.name).join(' + ')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Thời gian:</span>
            <span className="font-semibold text-slate-900">{maxDuration} phút</span>
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
            <span className="font-bold text-indigo-600">${totalPrice}</span>
          </div>
        </motion.div>
      )}

      <motion.button
        onClick={handleConfirmBooking}
        disabled={!isReadyToBook || loading}
        type="button"
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

      {selectedServices.some(s => s.requiresPayment) && (
        <p className="text-xs text-slate-500 text-center">
          🔒 Một số dịch vụ yêu cầu thanh toán trực tuyến
        </p>
      )}
    </div>
  )
}
