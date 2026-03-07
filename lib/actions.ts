'use server'

import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new (PrismaClient as any)({ adapter })
}

export async function createUserInDB(email: string, name?: string) {
  const prisma = getPrismaClient()
  try {
    
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: true, user: existingUser }
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        role: 'user',
      },
    })

    await prisma.$disconnect()
    return { success: true, user }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getAllUsers() {
  const prisma = getPrismaClient()
  try {
    const users = await prisma.user.findMany({
      include: { bookings: true },
      orderBy: { id: 'desc' },
    })

    return { success: true, users }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateUser(id: string, email: string, name: string, role: string) {
  const prisma = getPrismaClient()
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { email, name, role },
      include: { bookings: true },
    })

    return { success: true, user }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function deleteUser(id: string) {
  const prisma = getPrismaClient()
  try {
    // Delete bookings first due to foreign key constraint
    await prisma.booking.deleteMany({
      where: { userId: id },
    })

    const user = await prisma.user.delete({
      where: { id },
    })

    return { success: true, user }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: (error as Error).message }
  }
}