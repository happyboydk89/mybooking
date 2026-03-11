'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Star, X } from 'lucide-react'
import { toast } from 'sonner'

interface BookingReviewButtonProps {
  bookingId: string
  serviceName: string
  businessName: string
  initialReview?: {
    rating: number
    comment?: string | null
  } | null
}

export default function BookingReviewButton({
  bookingId,
  serviceName,
  businessName,
  initialReview,
}: BookingReviewButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(initialReview?.rating || 5)
  const [comment, setComment] = useState(initialReview?.comment || '')

  const submitReview = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId,
            rating,
            comment,
          }),
        })

        const result = await response.json()
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Không thể lưu đánh giá')
        }

        toast.success(initialReview ? 'Đã cập nhật đánh giá' : 'Đã gửi đánh giá', {
          description: `${serviceName} tại ${businessName}`,
        })
        setIsOpen(false)
        router.refresh()
      } catch (error) {
        toast.error('Lưu đánh giá thất bại', {
          description: (error as Error).message,
        })
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
      >
        {initialReview ? 'Sửa đánh giá' : 'Đánh giá'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Đánh giá trải nghiệm</h2>
                <p className="mt-1 text-sm text-slate-500">{serviceName} • {businessName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Chấm điểm</p>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const value = index + 1
                    const active = value <= rating

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="rounded-md p-1 transition hover:scale-105"
                        aria-label={`Đánh giá ${value} sao`}
                      >
                        <Star className={`h-7 w-7 ${active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Nhận xét</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm thực tế của bạn để giúp khách hàng khác ra quyết định tốt hơn."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-amber-200 transition focus:ring-2"
                />
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={submitReview}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? 'Đang lưu...' : initialReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
