import { getBusinessDetails } from '@/lib/actions'
import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { BusinessHeroImage } from '@/components/BusinessHeroImage'
import { BusinessDetailClient } from '@/components/BusinessDetailClient'
import { MapPin, Phone, Star } from 'lucide-react'

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
        {/* Business Info Card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8 space-y-6 mb-8">
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

        {/* Client Component for Services and Booking */}
        <BusinessDetailClient
          businessId={businessId}
          userId={user.id}
          businessName={business.name}
          services={business.services}
          availabilities={business.availabilities}
          ratings={{
            rating,
            reviewCount,
            reviews: business.reviews as any[],
          }}
        />
      </div>

      {/* Bottom Spacing */}
      <div className="h-12" />
    </div>
  )
}
