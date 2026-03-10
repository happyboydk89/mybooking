export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createService } from '@/lib/actions'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const businessId = formData.get('businessId') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const duration = parseInt(formData.get('duration') as string, 10)
    const requiresPayment = formData.get('requiresPayment') === 'true'

    if (!businessId || !name || isNaN(price) || isNaN(duration)) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid required fields' },
        { status: 400 }
      )
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, providerId: true },
    })

    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    if (business.providerId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to add services to this business' },
        { status: 403 }
      )
    }

    const result = await createService(businessId, name, price, duration, description, requiresPayment)

    if (result.success) {
      return NextResponse.json({ success: true, service: result.service })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
