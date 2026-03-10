export const runtime = 'nodejs'

import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, setTokenCookie } from '@/lib/auth'
import { createToken } from '@/lib/token'

export async function POST(request: Request) {
  try {
    const { accessToken, name, avatarUrl } = await request.json()

    if (!accessToken || typeof accessToken !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid social session token' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Supabase is not configured' },
        { status: 500 }
      )
    }

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseKey,
      },
      cache: 'no-store',
    })

    if (!userRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Invalid social session token' },
        { status: 401 }
      )
    }

    const socialUser = await userRes.json()
    const email = typeof socialUser?.email === 'string' ? socialUser.email : ''

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required for social login' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedName = typeof name === 'string' && name.trim() ? name.trim() : null
    const normalizedAvatarUrl =
      typeof avatarUrl === 'string' && avatarUrl.trim() ? avatarUrl.trim() : null

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      const randomPassword = crypto.randomUUID()
      const hashed = await hashPassword(randomPassword)

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: normalizedName,
          avatarUrl: normalizedAvatarUrl,
          password: hashed,
          role: 'CUSTOMER',
        },
      })
    } else if ((normalizedName && !user.name) || (normalizedAvatarUrl && !user.avatarUrl)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: user.name || normalizedName,
          avatarUrl: user.avatarUrl || normalizedAvatarUrl,
        },
      })
    }

    const token = createToken(user.id)
    await setTokenCookie(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Social login bridge error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
