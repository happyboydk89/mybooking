import { getBusinessDetails } from '@/lib/actions'
import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BookingWidget from '@/components/BookingWidget'
import { ServiceCard } from '@/components/ServiceCard'
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Business Header / Hero Section */}
      <div className="relative h-64 bg-gradient-to-br from-indigo-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-pattern"></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-end pb-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white">{business.name}</h1>
          </div>
        </div>
      </div>

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

              {/* Rating (Mock) */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-slate-600">(48 bình luận)</span>
              </div>
            </div>

            {/* Services Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Dịch vụ</h2>
              
              {business.services.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                  <p className="text-amber-800 font-medium">Không có dịch vụ nào được cung cấp</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {business.services.map((service: any) => (
                    <ServiceCard
                      key={service.id}
                      name={service.name}
                      description={service.description}
                      price={service.price}
                      duration={service.duration}
                      onSelect={() => {
                        // This will be handled by the widget
                      }}
                    />
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
