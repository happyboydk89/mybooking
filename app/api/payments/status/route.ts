/**
 * Payment Status Check API
 * 
 * Allows checking the status of a payment/booking
 * Useful after returning from payment gateway
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get booking ID from query params
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get booking with payment info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        payment: true,
        user: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify booking belongs to user
    if (booking.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        service: {
          name: booking.service.name,
          price: booking.service.price,
        },
        date: booking.date,
        timeSlot: booking.timeSlot,
        payment: booking.payment
          ? {
              status: booking.payment.status,
              transactionId: booking.payment.transactionId,
              provider: booking.payment.provider,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check payment status' },
      { status: 500 }
    )
  }
}
