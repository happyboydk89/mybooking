'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { createBooking, createBookingWithPayment } from '@/lib/actions'

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

export default function BookingClient({
  businessId,
  userId,
  services,
  availabilities,
}: {
  businessId: string
  userId: string
  services: Service[]
  availabilities: Availability[]
}) {
  const [step, setStep] = useState<'service' | 'date' | 'time' | 'confirm'>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed' | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)

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

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setStep('date')
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    const slots = generateTimeSlots(date)
    if (slots.length === 0) {
      alert('No available time slots for this day')
      return
    }
    setStep('time')
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep('confirm')
  }

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !userId || !businessId) {
      alert('Please fill in all details')
      return
    }

    setLoading(true)
    try {
      // If service requires payment, create booking with payment
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
          setBookingId(result.booking.id)
          setPaymentStatus('pending')
          // Proceed to payment creation
          await handleInitiatePayment(result.booking.id)
        } else {
          alert('Failed to create booking: ' + result.error)
          setPaymentStatus('failed')
        }
      } else {
        // No payment required, create booking directly
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
      alert('Error creating booking: ' + (error as Error).message)
      setPaymentStatus('failed')
    } finally {
      setLoading(false)
    }
  }

  const handleInitiatePayment = async (bookingIdParam: string) => {
    try {
      setPaymentStatus('processing')
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingIdParam,
          paymentProvider: 'ZALOPAY',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create payment')
      }

      const data = await response.json()

      if (data.success && data.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = data.paymentUrl
      } else {
        setPaymentStatus('failed')
        alert('Failed to get payment URL: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      setPaymentStatus('failed')
      alert('Payment error: ' + (error as Error).message)
    }
  }

  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : []

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {/* Step 1: Service Selection */}
        {step === 'service' && (
          <motion.div
            key="service-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-6">Select a Service</h2>
            <div className="grid grid-cols-1 gap-4">
              {services.length === 0 ? (
                <p className="text-gray-600">No services available</p>
              ) : (
                services.map((service) => (
                  <motion.button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="font-bold text-lg">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <div className="mt-2 flex justify-between">
                      <span className="font-semibold text-blue-600">${service.price}</span>
                      <span className="text-sm text-gray-500">{service.duration} min</span>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: Date Selection */}
        {step === 'date' && (
          <motion.div
            key="date-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => setStep('service')}
              className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold mb-6">
              Select a Date for {selectedService?.name}
            </h2>
            <div className="bg-white p-4 rounded-lg border border-gray-300 inline-block">
              <Calendar onChange={(date) => handleDateSelect(date as Date)} minDate={new Date()} />
            </div>
          </motion.div>
        )}

        {/* Step 3: Time Selection */}
        {step === 'time' && (
          <motion.div
            key="time-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => setStep('date')}
              className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold mb-2">Select a Time</h2>
            <p className="text-gray-600 mb-6">
              {selectedDate?.toLocaleDateString()} - {selectedService?.name}
            </p>

            <div className="grid grid-cols-3 gap-3">
              {timeSlots.length === 0 ? (
                <p className="col-span-3 text-gray-600">No time slots available</p>
              ) : (
                timeSlots.map((time) => (
                  <motion.button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`p-3 rounded-lg font-semibold transition ${
                      selectedTime === time
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-blue-100'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {time}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirm' && (
          <motion.div
            key="confirm-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => setStep('time')}
              className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              ← Back
            </button>
            <h2 className="text-2xl font-bold mb-6">Confirm Your Booking</h2>

            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h3 className="card-title">Booking Summary</h3>
                <div className="space-y-2">
                  <p>
                    <strong>Service:</strong> {selectedService?.name}
                  </p>
                  <p>
                    <strong>Date:</strong> {selectedDate?.toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong> {selectedTime}
                  </p>
                  <p>
                    <strong>Duration:</strong> {selectedService?.duration} minutes
                  </p>
                  <p>
                    <strong>Price:</strong> ${selectedService?.price}
                  </p>
                  {selectedService?.requiresPayment && (
                    <p className="text-sm text-blue-600 font-semibold mt-2">
                      🔒 This service requires online payment
                    </p>
                  )}
                </div>

                {/* Success Status */}
                {bookingSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="alert alert-success mt-4"
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
                      />
                    </svg>
                    <span>✅ Booking confirmed successfully! Redirecting...</span>
                  </motion.div>
                )}

                {/* Payment Processing Status */}
                {paymentStatus === 'processing' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="alert alert-info mt-4"
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>⏳ Processing payment... Redirecting to payment gateway...</span>
                  </motion.div>
                )}

                {/* Payment Failed Status */}
                {paymentStatus === 'failed' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="alert alert-error mt-4"
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
                        d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m9-11a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>❌ Payment failed. Please try again.</span>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="card-actions justify-end mt-4">
                  {selectedService?.requiresPayment ? (
                    <motion.button
                      onClick={handleConfirmBooking}
                      disabled={loading || bookingSuccess || paymentStatus === 'processing' || paymentStatus === 'failed'}
                      className="btn btn-primary gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {paymentStatus === 'processing' && (
                        <span className="loading loading-spinner loading-sm"></span>
                      )}
                      {loading
                        ? 'Creating Booking...'
                        : paymentStatus === 'failed'
                          ? 'Try Payment Again'
                          : '💳 Pay Now'}
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleConfirmBooking}
                      disabled={loading || bookingSuccess}
                      className="btn btn-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loading ? 'Creating Booking...' : 'Confirm Booking'}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
