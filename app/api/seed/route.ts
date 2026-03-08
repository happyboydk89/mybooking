export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

// defer heavy/Node‑only imports until we actually need the database client
async function getPrismaClient() {
  const { PrismaClient } = await import('../../../lib/generated/prisma/client')
  const { PrismaPg } = await import('@prisma/adapter-pg')
  const { Pool } = await import('pg')

  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new (PrismaClient as any)({ adapter })
}

const fakeUsers = [
  { email: 'user1@example.com', name: 'Alice Johnson' },
  { email: 'user2@example.com', name: 'Bob Smith' },
  { email: 'user3@example.com', name: 'Charlie Brown' },
  { email: 'user4@example.com', name: 'Diana Prince' },
  { email: 'user5@example.com', name: 'Edward Norton' },
  { email: 'user6@example.com', name: 'Fiona Green' },
  { email: 'user7@example.com', name: 'George Harris' },
  { email: 'user8@example.com', name: 'Hannah Lee' },
  { email: 'user9@example.com', name: 'Isaac Miller' },
  { email: 'user10@example.com', name: 'Julia Davis' },
  { email: 'user11@example.com', name: 'Kevin Wilson' },
  { email: 'user12@example.com', name: 'Laura Martinez' },
  { email: 'user13@example.com', name: 'Michael Taylor' },
  { email: 'user14@example.com', name: 'Nancy Anderson' },
  { email: 'user15@example.com', name: 'Oliver Thomas' },
  { email: 'user16@example.com', name: 'Paula Jackson' },
  { email: 'user17@example.com', name: 'Quinn White' },
  { email: 'user18@example.com', name: 'Rachel Harris' },
  { email: 'user19@example.com', name: 'Steven Clark' },
  { email: 'user20@example.com', name: 'Tina Rodriguez' },
]

export async function POST(request: NextRequest) {
  const prisma = await getPrismaClient()
  try {
    console.log('Starting seed...')
    const createdUsers = []

    // Create 20 users
    console.log('Creating users...')
    for (const userData of fakeUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      })

      if (!existingUser) {
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            role: 'CUSTOMER',
            password: 'password123', // simple password for all, no hash for now
          },
        })
        createdUsers.push(user)
      } else {
        createdUsers.push(existingUser)
      }
    }
    console.log(`Created ${createdUsers.length} users`)

    return NextResponse.json({
      success: true,
      message: `Created ${createdUsers.length} users`,
      usersCreated: createdUsers.length,
      users: createdUsers,
    })
  } catch (error) {
    console.error('Seed error:', error)
    console.error('Error stack:', (error as Error).stack)
    return NextResponse.json(
      { success: false, error: (error as Error).message, stack: (error as Error).stack },
      { status: 500 }
    )
  }
}