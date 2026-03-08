export const runtime = 'nodejs';

import { NextResponse } from 'next/server'
import { registerUser, setTokenCookie } from '@/lib/auth'
import { createToken } from '@/lib/token'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log('Register attempt:', { email, password: password ? '***' : undefined })
    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json({ success: false, error: 'Email và password là bắt buộc' }, { status: 400 })
    }
    const result = await registerUser(email, password)
    console.log('Register result:', result)
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
    const token = createToken(result.user.id)
    await setTokenCookie(token)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
