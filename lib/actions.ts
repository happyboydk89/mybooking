'use server'

import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export async function createUserInDB(email: string, name?: string, password?: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: true, user: existingUser }
    }

    const hashed = password
      ? await bcrypt.hash(password, 10)
      : await bcrypt.hash(Math.random().toString(36).slice(2), 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || null,
        role: 'CUSTOMER',
      },
    })

    return { success: true, user }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function getAllUsers() {
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

// create a service under a specific business
export async function createService(
  businessId: string,
  name: string,
  price: number,
  duration: number
) {
  try {
    const service = await prisma.service.create({
      data: {
        businessId,
        name,
        price,
        duration,
      },
    })
    return { success: true, service }
  } catch (error) {
    console.error('Error creating service:', error)
    return { success: false, error: (error as Error).message }
  }
}

// get list of customers (users) who have at least one confirmed booking for a business
export async function getCustomersForBusiness(businessId: string) {
  try {
    const customers = await prisma.user.findMany({
      where: {
        bookings: {
          some: {
            businessId,
            status: 'CONFIRMED',
          },
        },
      },
      include: {
        bookings: {
          where: { businessId, status: 'CONFIRMED' },
        },
      },
    })
    return { success: true, customers }
  } catch (error) {
    console.error('Error fetching customers:', error)
    return { success: false, error: (error as Error).message }
  }
}

// helper to fetch business owned by a provider user
export async function getBusinessByProvider(providerId: string) {
  try {
    const business = await prisma.business.findFirst({
      where: { providerId },
    })
    return { success: true, business }
  } catch (error) {
    console.error('Error fetching business:', error)
    return { success: false, error: (error as Error).message }
  }
}