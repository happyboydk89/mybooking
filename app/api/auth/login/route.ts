export const runtime = 'nodejs';

import { NextResponse } from 'next/server'
import { authenticateUser, setTokenCookie } from '@/lib/auth'
import { createToken } from '@/lib/token'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email và password là bắt buộc' }, { status: 400 })
    }
    const user = await authenticateUser(email, password)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }
    const token = createToken(user.id)
    await setTokenCookie(token)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
