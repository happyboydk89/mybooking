import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth'
import { getBusinessByProvider, getBusinessAvailabilities, updateBusinessAvailabilities } from '@/lib/actions'
import BusinessHoursClient from './client'

interface AvailabilityDay {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string
  endTime: string
  isActive: boolean
}

export default async function BusinessHoursPage() {
  const user = await getUserFromRequest()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's business
  const { success: businessSuccess, business } = await getBusinessByProvider(user.id)

  if (!businessSuccess || !business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Cấu hình thời gian làm việc</h1>
            <p className="text-slate-600 mb-4">
              Bạn cần tạo một doanh nghiệp trước khi có thể cấu hình thời gian làm việc.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Quay lại bảng điều khiển
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Get current availabilities
  const { success: availSuccess, availabilities = [] } = await getBusinessAvailabilities(business.id)

  // Ensure all days exist
  const allDays: Array<'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'> = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ]
  const availabilityMap = new Map<string, AvailabilityDay>(
    (availabilities || []).map((a: any) => [
      a.dayOfWeek,
      {
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        isActive: a.isActive,
      } as AvailabilityDay,
    ])
  )

  const initialAvailability: AvailabilityDay[] = allDays.map((day) => {
    const existing = availabilityMap.get(day)
    return (
      existing || {
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isActive: false,
      }
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <BusinessHoursClient
            businessId={business.id}
            businessName={business.name}
            initialAvailability={initialAvailability}
          />
        </div>
      </div>
    </div>
  )
}
