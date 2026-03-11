export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const bookingId = typeof body?.bookingId === 'string' ? body.bookingId : ''
    const comment = typeof body?.comment === 'string' ? body.comment.trim() : ''
    const rating = Number(body?.rating)

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Booking is required' }, { status: 400 })
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        review: true,
      },
    })

    if (!booking || booking.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { success: false, error: 'Only confirmed bookings can be reviewed' },
        { status: 400 }
      )
    }

    if (new Date(booking.date) > new Date()) {
      return NextResponse.json(
        { success: false, error: 'You can review after the appointment is completed' },
        { status: 400 }
      )
    }

    const review = booking.review
      ? await prisma.review.update({
          where: { bookingId },
          data: {
            rating,
            comment: comment || null,
          },
        })
      : await prisma.review.create({
          data: {
            bookingId,
            businessId: booking.businessId,
            userId: user.id,
            rating,
            comment: comment || null,
          },
        })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Error saving review:', error)
    return NextResponse.json({ success: false, error: 'Failed to save review' }, { status: 500 })
  }
}
