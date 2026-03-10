export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getUserBusinesses } from '@/lib/actions'

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
