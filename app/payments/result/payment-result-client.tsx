'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface BookingStatus {
  id: string
  status: string
  paymentStatus: string
  service: {
    name: string
    price: number
  }
  date: string
  timeSlot: string
  payment: {
    status: string
    transactionId: string
    provider: string
  } | null
}

export default function PaymentResultClient() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided')
      setLoading(false)
      return
    }

    // Check payment status
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/status?bookingId=${bookingId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch payment status')
        }
        const data = await response.json()
        if (data.success) {
          setBookingStatus(data.booking)
        } else {
          setError(data.error || 'Failed to fetch booking status')
        }
      } catch (err) {
        setError((err as Error).message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    // Check status after a short delay to allow webhook processing
    const timer = setTimeout(checkStatus, 1500)
    return () => clearTimeout(timer)
  }, [bookingId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="loading loading-spinner loading-lg text-blue-600"></span>
          <p className="mt-4 text-lg font-semibold">Checking payment status...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="card bg-error shadow-xl max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="card-body">
            <h2 className="card-title text-error-content">❌ Error</h2>
            <p className="text-error-content">{error}</p>
            <div className="card-actions justify-end mt-4">
              <Link href="/dashboard">
                <button className="btn btn-primary">Go to Dashboard</button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const isSuccess = bookingStatus?.paymentStatus === 'SUCCESS'
  const isFailed = bookingStatus?.paymentStatus === 'FAILED'

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        className={`card shadow-xl max-w-md ${isSuccess ? 'bg-success' : isFailed ? 'bg-error' : 'bg-warning'}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="card-body">
          <div className="card-title text-center">
            {isSuccess ? (
              <span className="text-4xl">✅ Payment Successful!</span>
            ) : isFailed ? (
              <span className="text-4xl">❌ Payment Failed</span>
            ) : (
              <span className="text-4xl">⏳ Payment Pending</span>
            )}
          </div>

          <div className="divider"></div>

          {bookingStatus && (
            <div className="space-y-3">
              <div>
                <p className="text-sm opacity-75">Service</p>
                <p className="font-semibold">{bookingStatus.service.name}</p>
              </div>
              <div>
                <p className="text-sm opacity-75">Date & Time</p>
                <p className="font-semibold">
                  {new Date(bookingStatus.date).toLocaleDateString()} at {bookingStatus.timeSlot}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-75">Amount</p>
                <p className="font-semibold">${bookingStatus.service.price}</p>
              </div>
              {bookingStatus.payment && (
                <div>
                  <p className="text-sm opacity-75">Transaction ID</p>
                  <p className="font-mono text-sm">{bookingStatus.payment.transactionId}</p>
                </div>
              )}
              <div>
                <p className="text-sm opacity-75">Booking Status</p>
                <p className="font-semibold capitalize">{bookingStatus.status}</p>
              </div>
            </div>
          )}

          <div className="divider"></div>

          {isSuccess && (
            <motion.div
              className="alert alert-info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>Your booking has been confirmed! Check your email for details.</span>
            </motion.div>
          )}

          {isFailed && (
            <motion.div
              className="alert alert-error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>Payment failed. Please try again or contact support.</span>
            </motion.div>
          )}

          <div className="card-actions justify-between mt-4">
            {isFailed ? (
              <>
                <Link href={`/business/${bookingStatus?.id}?retry=true`}>
                  <button className="btn btn-primary">Try Again</button>
                </Link>
                <Link href="/dashboard">
                  <button className="btn btn-outline">Go to Dashboard</button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard" className="w-full">
                <button className="btn btn-primary w-full">Go to Dashboard</button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
