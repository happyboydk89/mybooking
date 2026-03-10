export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { createService } from '@/lib/actions'
import { getUserFromRequest } from '@/lib/auth'

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
