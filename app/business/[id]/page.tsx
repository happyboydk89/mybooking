import { getBusinessDetails } from '@/lib/actions'
import { getUserFromRequest } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BookingClient from '@/components/BookingClient'

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
        <h1 className="text-3xl font-bold mb-4">Business Not Found</h1>
        <p>The business you are looking for does not exist.</p>
      </div>
    )
  }

  const business = result.business

  return (
    <div className="container mx-auto p-4">
      {/* Business Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
        <p className="text-lg text-gray-600 mb-2">{business.description}</p>
        <p className="text-sm text-gray-500">
          📍 {business.address} | 📞 {business.phone}
        </p>
      </div>

      {/* Booking Client Component */}
      <BookingClient
        businessId={businessId}
        userId={user.id}
        services={business.services}
        availabilities={business.availabilities}
      />
    </div>
  )
}
