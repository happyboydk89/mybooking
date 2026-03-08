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

// update or create availability for a business on a specific day
export async function updateAvailability(
  businessId: string,
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  isActive: boolean
) {
  try {
    const availability = await prisma.availability.upsert({
      where: {
        businessId_dayOfWeek: {
          businessId,
          dayOfWeek: dayOfWeek as any,
        },
      },
      update: {
        startTime,
        endTime,
        isActive,
      },
      create: {
        businessId,
        dayOfWeek: dayOfWeek as any,
        startTime,
        endTime,
        isActive,
      },
    })
    return { success: true, availability }
  } catch (error) {
    console.error('Error updating availability:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Get all businesses owned by a user
export async function getUserBusinesses(userId: string) {
  try {
    const businesses = await prisma.business.findMany({
      where: { providerId: userId },
      include: {
        services: true,
        availabilities: true,
      },
    })
    return { success: true, businesses }
  } catch (error) {
    console.error('Error fetching user businesses:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Create a new business for a user
export async function createBusiness(
  userId: string,
  name: string,
  description: string,
  address: string,
  phone: string,
  industryType: string
) {
  try {
    const business = await prisma.business.create({
      data: {
        name,
        description,
        address,
        phone,
        industryType: industryType as any,
        providerId: userId,
      },
    })
    return { success: true, business }
  } catch (error) {
    console.error('Error creating business:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Get business details by ID for customer view
export async function getBusinessDetails(businessId: string) {
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        services: true,
        availabilities: true,
      },
    })
    return { success: true, business }
  } catch (error) {
    console.error('Error fetching business details:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Create a booking
export async function createBooking(
  userId: string,
  businessId: string,
  serviceId: string,
  date: Date,
  timeSlot: string
) {
  try {
    const booking = await prisma.booking.create({
      data: {
        userId,
        businessId,
        serviceId,
        date,
        timeSlot,
        status: 'PENDING',
      },
    })
    return { success: true, booking }
  } catch (error) {
    console.error('Error creating booking:', error)
    return { success: false, error: (error as Error).message }
  }
}