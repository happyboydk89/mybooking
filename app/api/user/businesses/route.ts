export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { createBusiness, getUserBusinesses } from '@/lib/actions'

export async function GET() {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getUserBusinesses(user.id)

    if (result.success) {
      return NextResponse.json({
        success: true,
        businesses: result.businesses,
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const description = typeof body?.description === 'string' ? body.description.trim() : ''
    const address = typeof body?.address === 'string' ? body.address.trim() : ''
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
    const industryType = typeof body?.industryType === 'string' ? body.industryType : ''

    const validIndustryTypes = ['HAIR_SALON', 'CLINIC', 'SPA_MASSAGE'] as const

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Business name is required' },
        { status: 400 }
      )
    }

    if (!validIndustryTypes.includes(industryType as (typeof validIndustryTypes)[number])) {
      return NextResponse.json(
        { success: false, error: 'Invalid industry type' },
        { status: 400 }
      )
    }

    const result = await createBusiness(user.id, name, description, address, phone, industryType)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create business' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, business: result.business })
  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create business' },
      { status: 500 }
    )
  }
}
