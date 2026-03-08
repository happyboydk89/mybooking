import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Debug API called')
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'not set')
    const users = await prisma.user.findMany()
    console.log('[DB Stats] Total users:', users.length)
    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack,
    }, { status: 500 })
  }
}
