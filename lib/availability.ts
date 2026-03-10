'use server'

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import {
  addMinutes,
  format,
  isBefore,
  isEqual,
  parse,
  getDay,
  areIntervalsOverlapping,
} from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new (PrismaClient as any)({ adapter })
}

// utility: compute available time slots for a business on a given date
export async function getAvailableSlots(
  businessId: string,
  // a Date or an ISO string representing the day we are interested in
  date: string | Date,
  // duration of the service in minutes
  serviceDuration: number
): Promise<string[]> {
  const prisma = getPrismaClient()

  // normalize input date to a Date object and strip time portion
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  // determine day of week in Prisma enum format
  // getDay(): 0 = Sunday, 1 = Monday ... 6 = Saturday
  const dayMap = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ] as const
  const dayOfWeek = dayMap[getDay(targetDate) as number]

  // timezone, fallback to system default if not set
  const tz = process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone

  // fetch availability windows for that business/day
  const availabilities = await prisma.availability.findMany({
    where: {
      businessId,
      dayOfWeek,
      isActive: true,
    },
  })

  // fetch confirmed bookings for that business on the given date
  const dayStart = new Date(targetDate)
  const dayEnd = new Date(targetDate)
  dayEnd.setHours(23, 59, 59, 999)

  const bookings = await prisma.booking.findMany({
    where: {
      businessId,
      status: 'CONFIRMED',
      date: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    include: { service: true },
  })

  // convert bookings into simple intervals (in the business's timezone)
  const bookingIntervals = bookings.map((b: any) => {
    const zonedStart = toZonedTime(b.date, tz)
    const zonedEnd = addMinutes(zonedStart, b.service.duration)
    return { start: zonedStart, end: zonedEnd }
  })

  const slots: string[] = []

  for (const avail of availabilities) {
    // build the start/end boundaries as zoned Date objects on target date
    const [startH, startM] = avail.startTime.split(':').map(Number)
    const [endH, endM] = avail.endTime.split(':').map(Number)

    const windowStartLocal = new Date(targetDate)
    windowStartLocal.setHours(startH, startM, 0, 0)

    const windowEndLocal = new Date(targetDate)
    windowEndLocal.setHours(endH, endM, 0, 0)

    // iterate slots within this availability window
    let slotStart = new Date(windowStartLocal)
    let slotEnd = addMinutes(slotStart, serviceDuration)

    while (
      isBefore(slotEnd, windowEndLocal) ||
      isEqual(slotEnd, windowEndLocal)
    ) {
      // check for collision with any booking
      const collision = bookingIntervals.some((bi: any) =>
        areIntervalsOverlapping(
          { start: slotStart, end: slotEnd },
          { start: bi.start, end: bi.end },
          { inclusive: false }
        )
      )

      if (!collision) {
        slots.push(format(slotStart, 'HH:mm'))
      }

      // advance to next slot
      slotStart = new Date(slotEnd)
      slotEnd = addMinutes(slotStart, serviceDuration)
    }
  }

  // close the Prisma connection (optional but good hygiene)
  await prisma.$disconnect()

  return slots
}
