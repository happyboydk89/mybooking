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

    const { businessId, serviceIds, date, timeSlot } = await request.json()

    if (!businessId || !serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0 || !date || !timeSlot) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if all services exist and belong to the same business
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      include: {
        business: {
          include: {
            provider: true,
          },
        },
      },
    })

    if (services.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Services not found' },
        { status: 404 }
      )
    }

    const allSameBusinessId = services.every(s => s.businessId === businessId)
    if (!allSameBusinessId) {
      return NextResponse.json(
        { success: false, error: 'All services must belong to the same business' },
        { status: 400 }
      )
    }

    // Prevent users from booking their own services
    if (services[0].business.providerId === user.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot book your own service' },
        { status: 403 }
      )
    }

    // Create booking with multiple services
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        businessId,
        date: new Date(date),
        timeSlot,
        status: 'PENDING',
        services: {
          create: serviceIds.map(serviceId => ({
            serviceId,
          })),
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
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
