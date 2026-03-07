import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '../../../lib/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

function getPrismaClient() {
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
]

const fakeBookings = [
  { title: 'Team Meeting', description: 'Weekly sync for project updates' },
  { title: 'Client Presentation', description: 'Q1 results presentation' },
  { title: 'Training Session', description: 'New tool training for the team' },
  { title: 'Conference Call', description: 'International team standup' },
  { title: 'Project Review', description: 'Sprint retrospective' },
  { title: 'Interview', description: 'Candidate interview round 1' },
  { title: 'Workshop', description: 'Professional development workshop' },
  { title: 'Networking Event', description: 'Industry networking meetup' },
  { title: 'Product Demo', description: 'New feature demonstration' },
  { title: 'Strategy Planning', description: 'Quarterly strategy planning session' },
]

export async function POST(request: NextRequest) {
  const prisma = getPrismaClient()
  try {

    const createdUsers = []

    // Create 10 users
    for (const userData of fakeUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      })

      if (!existingUser) {
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            role: 'user',
          },
        })
        createdUsers.push(user)
      } else {
        createdUsers.push(existingUser)
      }
    }

    // Create 10 bookings for the users
    const createdBookings = []
    for (let i = 0; i < fakeBookings.length; i++) {
      const user = createdUsers[i]
      const bookingData = fakeBookings[i]
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1)

      const booking = await prisma.booking.create({
        data: {
          userId: user.id,
          title: bookingData.title,
          description: bookingData.description,
          date: futureDate,
        },
      })
      createdBookings.push(booking)
    }


    return NextResponse.json({
      success: true,
      message: `Created ${createdUsers.length} users and ${createdBookings.length} bookings`,
      usersCreated: createdUsers.length,
      bookingsCreated: createdBookings.length,
      users: createdUsers,
      bookings: createdBookings,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}