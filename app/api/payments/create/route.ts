/**
 * Payment Creation API Endpoint
 * 
 * Handles:
 * 1. Receiving booking payment request
 * 2. Creating payment order with payment provider
 * 3. Returning payment URL for redirect
 */

import { NextResponse } from 'next/server'
import { createZaloPayOrder } from '@/lib/payments/zalopay'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, paymentProvider = 'ZALOPAY' } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get booking with services and user info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        user: true,
        business: true,
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

    // Check if any service requires payment
    const servicesRequiringPayment = booking.services.filter(bs => bs.service.requiresPayment)
    if (servicesRequiringPayment.length === 0) {
      return NextResponse.json(
        { success: false, error: 'None of the selected services require payment' },
        { status: 400 }
      )
    }

    // Calculate total amount
    const totalAmount = booking.services.reduce((sum, bs) => sum + bs.service.price, 0)
    const serviceNames = booking.services.map(bs => bs.service.name).join(' + ')
    const maxDuration = Math.max(...booking.services.map(bs => bs.service.duration))

    // Create payment order based on provider
    let paymentResult: any = null

    if (paymentProvider === 'ZALOPAY') {
      paymentResult = await createZaloPayOrder(
        {
          id: booking.id,
          userId: booking.userId,
          serviceName: serviceNames,
          amount: totalAmount,
          date: booking.date.toISOString().split('T')[0],
          timeSlot: booking.timeSlot || '',
          duration: maxDuration,
        },
        {
          id: user.id,
          email: user.email,
          name: user.name || '',
          phone: user.phone,
        }
      )
    } else if (paymentProvider === 'VNPAY') {
      return NextResponse.json(
        { success: false, error: 'VNPay payment is not yet available' },
        { status: 501 }
      )
    } else if (paymentProvider === 'MOMO') {
      return NextResponse.json(
        { success: false, error: 'MoMo payment is not yet available' },
        { status: 501 }
      )
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid payment provider' },
        { status: 400 }
      )
    }

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.error },
        { status: 400 }
      )
    }

    // Update payment in database
    if (paymentResult.transactionId) {
      await prisma.payment.update({
        where: {
          bookingId: booking.id,
        },
        data: {
          transactionId: paymentResult.transactionId,
          status: 'PENDING',
        },
      })
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResult.paymentUrl,
      transactionId: paymentResult.transactionId,
      bookingId: booking.id,
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
