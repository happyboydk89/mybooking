'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import BookingWidget from '@/components/BookingWidget'
import { ServicesList } from '@/components/ServicesList'

interface Service {
  id: string
  name: string
  description?: string | null
  price: number
  duration: number
  requiresPayment?: boolean
  image?: string | null
}

interface Availability {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  isActive: boolean
}

interface BusinessDetailClientProps {
  businessId: string
  userId: string
  businessName: string
  services: Service[]
  availabilities: Availability[]
  ratings: {
    rating: number
    reviewCount: number
    reviews: any[]
  }
}

function initialsFromName(name?: string | null, email?: string | null) {
  const source = (name || email || '?').trim()
  return source.slice(0, 1).toUpperCase()
}

export function BusinessDetailClient({
  businessId,
  userId,
  businessName,
  services,
  availabilities,
  ratings,
}: BusinessDetailClientProps) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set())

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServiceIds((prev) => {
      const newSelected = new Set(prev)
      if (newSelected.has(serviceId)) {
        newSelected.delete(serviceId)
      } else {
        newSelected.add(serviceId)
      }
      return newSelected
    })
  }

  // Get the full service objects from selected IDs
  const selectedServices = services.filter((s) => selectedServiceIds.has(s.id))

  const { rating, reviewCount, reviews } = ratings

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - 60% on desktop */}
      <div className="lg:col-span-2 space-y-8">
        {/* Services Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Dịch vụ</h2>
          <ServicesList
            services={services}
            selectedServiceIds={selectedServiceIds}
            onToggleSelection={toggleServiceSelection}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Đánh giá từ khách hàng</h2>
            <span className="text-sm text-slate-500">{reviewCount} nhận xét</span>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              Chưa có đánh giá nào cho doanh nghiệp này.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                        {initialsFromName(review.user?.name, review.user?.email)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{review.user?.name || review.user?.email}</p>
                        <p className="text-sm text-slate-500">
                          {review.booking?.service?.name} • {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          className={`h-4 w-4 ${index < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="mt-4 text-sm leading-6 text-slate-600">{review.comment}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - 40% on desktop */}
      <div className="lg:col-span-1">
        <BookingWidget
          businessId={businessId}
          userId={userId}
          services={services}
          availabilities={availabilities}
          businessName={businessName}
          selectedServices={selectedServices}
          onToggleService={toggleServiceSelection}
        />
      </div>
    </div>
  )
}
