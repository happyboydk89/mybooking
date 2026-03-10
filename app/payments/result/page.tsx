/**
 * Payment Success/Return Page
 * 
 * This page shows after customer completes payment and is redirected back
 * Displays payment status and allows redirect to booking dashboard
 */

import { Suspense } from 'react'
import PaymentResultClient from './payment-result-client'

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-blue-600"></span>
          <p className="mt-4 text-lg font-semibold">Checking payment status...</p>
        </div>
      </div>
    }>
      <PaymentResultClient />
    </Suspense>
  )
}
