import { redirect } from 'next/navigation'
import { getUserFromRequest } from '@/lib/auth'
import { getBusinessByProvider, getBusinessAvailabilities } from '@/lib/actions'
import AvailabilityClient from './client'

type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

interface AvailabilityDay {
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  isActive: boolean
}

const allDays: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

export default async function AvailabilityPage() {
  const user = await getUserFromRequest()

  if (!user) {
    redirect('/auth/login')
  }

  const { success: businessSuccess, business } = await getBusinessByProvider(user.id)

  if (!businessSuccess || !business) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Thiết lập giờ mở cửa</h1>
        <p className="mt-3 text-slate-600">
          Bạn cần tạo doanh nghiệp trước khi thiết lập giờ làm việc.
        </p>
        <a
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Quay lại Dashboard
        </a>
      </div>
    )
  }

  const { availabilities = [] } = await getBusinessAvailabilities(business.id)

  const availabilityMap = new Map<string, AvailabilityDay>(
    (availabilities || []).map((item: any) => [
      item.dayOfWeek,
      {
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        isActive: item.isActive,
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
    <AvailabilityClient
      businessId={business.id}
      businessName={business.name}
      initialAvailability={initialAvailability}
    />
  )
}
