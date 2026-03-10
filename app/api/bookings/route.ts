export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { businessId, serviceId, date, timeSlot } = await request.json()

    if (!businessId || !serviceId || !date || !timeSlot) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user is the owner of this service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        business: {
          include: {
            provider: true,
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    // Prevent users from booking their own services
    if (service.business.providerId === user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot book your own service' },
        { status: 403 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        businessId,
        serviceId,
        date: new Date(date),
        timeSlot,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
