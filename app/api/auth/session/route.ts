export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getUserFromRequest()
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 })
    }
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ success: false, user: null }, { status: 500 })
  }
}
