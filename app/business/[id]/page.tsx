import { getBusinessDetails } from '@/lib/actions'
import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BookingWidget from '@/components/BookingWidget'
import { ServicesList } from '@/components/ServicesList'
import { BusinessHeroImage } from '@/components/BusinessHeroImage'
import { MapPin, Phone, Star } from 'lucide-react'

function initialsFromName(name?: string | null, email?: string | null) {
  const source = (name || email || '?').trim()
  return source.slice(0, 1).toUpperCase()
}

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: businessId } = await params

  // Get current user
  const user = await getUserFromRequest()
  if (!user) {
    redirect('/auth/login')
  }

  // Get business details with services and availability
  const result = await getBusinessDetails(businessId)
  if (!result.success || !result.business) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Không tìm thấy doanh nghiệp</h1>
        <p>Doanh nghiệp bạn đang tìm kiếm không tồn tại.</p>
      </div>
    )
  }

  const business = result.business
  const rating = business.rating ?? 0
  const reviewCount = business.reviewCount ?? 0

  // Dummy image URLs based on industry type
  const industryImages: Record<string, string> = {
    HAIR_SALON: 'https://picsum.photos/800/400?random=1',
    CLINIC: 'https://picsum.photos/800/400?random=2',
    SPA_MASSAGE: 'https://picsum.photos/800/400?random=3',
  }

  const businessImage = industryImages[business.industryType] || 'https://picsum.photos/800/400?random=4'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Business Header / Hero Section with Image */}
      <BusinessHeroImage
        businessName={business.name}
        industryType={business.industryType}
        businessImage={businessImage}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 60% on desktop */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Info Card */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Về doanh nghiệp</h2>
                <p className="text-slate-600 leading-relaxed">
                  {business.description ||
                    'Doanh nghiệp cung cấp dịch vụ chất lượng cao với đội ngũ chuyên nghiệp.'}
                </p>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Địa chỉ</p>
                    <p className="font-semibold text-slate-900">{business.address || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Điện thoại</p>
                    <p className="font-semibold text-slate-900">{business.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {reviewCount > 0 ? rating.toFixed(1) : 'Chưa có đánh giá'}
                </span>
                <span className="text-sm text-slate-600">
                  {reviewCount > 0 ? `(${reviewCount} đánh giá)` : '(Hãy là người đầu tiên đánh giá)'}
                </span>
              </div>
            </div>

            {/* Services Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Dịch vụ</h2>
              <ServicesList services={business.services} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Đánh giá từ khách hàng</h2>
                <span className="text-sm text-slate-500">{reviewCount} nhận xét</span>
              </div>

              {business.reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                  Chưa có đánh giá nào cho doanh nghiệp này.
                </div>
              ) : (
                <div className="space-y-4">
                  {business.reviews.map((review: any) => (
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
              userId={user.id}
              services={business.services}
              availabilities={business.availabilities}
              businessName={business.name}
            />
          </div>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-12" />
    </div>
  )
}
