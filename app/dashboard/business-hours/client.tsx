'use client'

import { updateBusinessAvailabilities } from '@/lib/actions'
import AvailabilityManager from '@/components/AvailabilityManager'

interface AvailabilityDay {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  startTime: string
  endTime: string
  isActive: boolean
}

interface BusinessHoursClientProps {
  businessId: string
  businessName: string
  initialAvailability: AvailabilityDay[]
}

export default function BusinessHoursClient({
  businessId,
  businessName,
  initialAvailability,
}: BusinessHoursClientProps) {
  const handleSave = async (availability: AvailabilityDay[]) => {
    const result = await updateBusinessAvailabilities(businessId, availability)
    if (!result.success) {
      throw new Error(result.error)
    }
  }

  return (
    <AvailabilityManager
      businessId={businessId}
      businessName={businessName}
      initialAvailability={initialAvailability}
      onSave={handleSave}
    />
  )
}
