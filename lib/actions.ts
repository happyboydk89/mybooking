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

// Get unique customers who have booked any business owned by a provider
export async function getCustomersForProvider(providerId: string) {
  try {
    const customers = await prisma.user.findMany({
      where: {
        bookings: {
          some: {
            business: {
              providerId,
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        bookings: {
          where: {
            business: {
              providerId,
            },
          },
          select: {
            id: true,
            date: true,
            status: true,
            business: {
              select: {
                id: true,
                name: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return { success: true, customers }
  } catch (error) {
    console.error('Error fetching provider customers:', error)
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

// Get all businesses for the public homepage
export async function getAllBusinesses() {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        services: true,
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, businesses }
  } catch (error) {
    console.error('Error fetching businesses:', error)
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
      include: {
        user: true,
        service: true,
      },
    })
    return { success: true, booking }
  } catch (error) {
    console.error('Error creating booking:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Update booking status (confirm or cancel)
export async function updateBookingStatus(
  bookingId: string,
  status: 'CONFIRMED' | 'CANCELLED'
) {
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: true,
        service: true,
        business: true,
      },
    })
    return { success: true, booking }
  } catch (error) {
    console.error('Error updating booking status:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Get bookings for a business with filters
export async function getBookingsForBusiness(
  businessId: string,
  filterType: 'all' | 'day' | 'week' | 'month' = 'all',
  startDate?: Date
) {
  try {
    let dateFilter: any = {}

    if (filterType === 'day' && startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(startDate)
      end.setHours(23, 59, 59, 999)
      dateFilter = {
        gte: start,
        lte: end,
      }
    } else if (filterType === 'week' && startDate) {
      const start = new Date(startDate)
      const dayOfWeek = start.getDay()
      const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      start.setDate(diff)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      dateFilter = {
        gte: start,
        lte: end,
      }
    } else if (filterType === 'month' && startDate) {
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
      start.setHours(0, 0, 0, 0)
      const end = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      dateFilter = {
        gte: start,
        lte: end,
      }
    }

    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    })
    return { success: true, bookings }
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Get single booking details
export async function getBookingById(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
        business: true,
      },
    })
    return { success: true, booking }
  } catch (error) {
    console.error('Error fetching booking:', error)
    return { success: false, error: (error as Error).message }
  }
}