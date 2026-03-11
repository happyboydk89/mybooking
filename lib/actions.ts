'use server'

import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { sendBatchEmails } from './email'

function attachBusinessRating<T extends { reviews?: Array<{ rating: number }> }>(business: T): T & { rating: number; reviewCount: number } {
  const reviews = business.reviews || []
  const reviewCount = reviews.length
  const rating = reviewCount === 0
    ? 0
    : Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1))

  return {
    ...business,
    rating,
    reviewCount,
  } as T & { rating: number; reviewCount: number }
}

// Utility function to clean business data for client components (removes Date objects)
function cleanBusinessForClient(business: any) {
  return {
    ...business,
    createdAt: business.createdAt?.toISOString?.() || business.createdAt,
    updatedAt: business.updatedAt?.toISOString?.() || business.updatedAt,
    services: business.services?.map((service: any) => ({
      ...service,
      createdAt: service.createdAt?.toISOString?.() || service.createdAt,
      updatedAt: service.updatedAt?.toISOString?.() || service.updatedAt,
    })) || [],
    reviews: business.reviews?.map((review: any) => ({
      ...review,
      createdAt: review.createdAt?.toISOString?.() || review.createdAt,
      updatedAt: review.updatedAt?.toISOString?.() || review.updatedAt,
    })) || [],
  }
}

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

export async function updateUser(id: string, email: string, name: string) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { email, name },
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
  duration: number,
  description?: string,
  requiresPayment: boolean = false
) {
  try {
    const service = await prisma.service.create({
      data: {
        businessId,
        name,
        price,
        duration,
        description: description || null,
        requiresPayment,
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
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    })
    return { success: true, businesses: businesses.map(attachBusinessRating) }
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
            services: {
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
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
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
            booking: {
              select: {
                id: true,
                date: true,
                services: {
                  include: {
                    service: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })
    return { success: true, business: business ? attachBusinessRating(business) : null }
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
        reviews: {
          select: {
            rating: true,
          },
        },
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
    const cleanedBusinesses = businesses
      .map(attachBusinessRating)
      .map(cleanBusinessForClient)
    return { success: true, businesses: cleanedBusinesses }
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Create a booking
export async function createBooking(
  userId: string,
  businessId: string,
  serviceIds: string[],
  date: Date,
  timeSlot: string
) {
  try {
    // Check if all services exist and get owner info
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      include: {
        business: {
          include: {
            provider: true,
          },
        },
      },
    })

    if (services.length === 0) {
      return { success: false, error: 'Services not found' }
    }

    // Check if all services belong to the same business
    const allSameBusinessId = services.every(s => s.businessId === businessId)
    if (!allSameBusinessId) {
      return { success: false, error: 'All services must belong to the same business' }
    }

    // Prevent users from booking their own services
    if (services[0].business.providerId === userId) {
      return { success: false, error: 'You cannot book your own service' }
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        businessId,
        date,
        timeSlot,
        status: 'PENDING',
        services: {
          create: serviceIds.map(serviceId => ({
            serviceId,
          })),
        },
      },
      include: {
        user: true,
        services: {
          include: {
            service: true,
          },
        },
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
        services: {
          include: {
            service: true,
          },
        },
        business: true,
      },
    })
    return { success: true, booking }
  } catch (error) {
    console.error('Error updating booking status:', error)
    return { success: false, error: (error as Error).message }
  }
}

export async function sendBookingReminder(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        services: {
          include: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
        business: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!booking) {
      return { success: false, error: 'Booking not found' }
    }

    const bookingDate = booking.date.toLocaleDateString('vi-VN')
    const bookingTime = booking.timeSlot || booking.date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    const customerName = booking.user.name || booking.user.email
    const serviceNames = booking.services.map(bs => bs.service.name).join(', ')

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 16px;">
          <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px;">
            <h2 style="margin: 0 0 12px 0; color: #0f172a;">Nhắc lịch hẹn</h2>
            <p style="margin: 0 0 8px 0; color: #334155;">Xin chào ${customerName},</p>
            <p style="margin: 0 0 16px 0; color: #334155;">
              Bạn có lịch hẹn sắp tới tại <strong>${booking.business.name}</strong>.
            </p>
            <ul style="padding-left: 18px; color: #334155; margin: 0 0 16px 0;">
              <li>Dịch vụ: ${serviceNames}</li>
              <li>Ngày: ${bookingDate}</li>
              <li>Giờ: ${bookingTime}</li>
              <li>Mã lịch hẹn: ${booking.id}</li>
            </ul>
            <p style="margin: 0; color: #64748b; font-size: 13px;">Vui lòng đến sớm 5-10 phút để được phục vụ tốt nhất.</p>
          </div>
        </body>
      </html>
    `

    const result = await sendBatchEmails({
      emails: [
        {
          to: booking.user.email,
          subject: `Nhắc lịch hẹn - ${serviceNames}`,
          html,
        },
      ],
    })

    if (!result.success) {
      return { success: false, error: 'Failed to send reminder email' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending booking reminder:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Create a booking with payment (if service requires payment)
export async function createBookingWithPayment(
  userId: string,
  businessId: string,
  serviceIds: string[],
  date: Date,
  timeSlot: string,
  paymentProvider: 'ZALOPAY' | 'VNPAY' | 'MOMO' = 'ZALOPAY'
) {
  try {
    // Check if services exist and get owner info
    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      include: {
        business: {
          include: {
            provider: true,
          },
        },
      },
    })

    if (services.length === 0) {
      return { success: false, error: 'Services not found' }
    }

    // Check if all services belong to the same business
    const allSameBusinessId = services.every(s => s.businessId === businessId)
    if (!allSameBusinessId) {
      return { success: false, error: 'All services must belong to the same business' }
    }

    // Prevent users from booking their own services
    if (services[0].business.providerId === userId) {
      return { success: false, error: 'You cannot book your own service' }
    }

    // Get user info for payment
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Calculate total price and check if any service requires payment
    const totalPrice = services.reduce((sum, service) => sum + service.price, 0)
    const requiresPayment = services.some(service => service.requiresPayment)

    // Create booking within transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create booking
      const booking = await tx.booking.create({
        data: {
          userId,
          businessId,
          date,
          timeSlot,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          services: {
            create: serviceIds.map(serviceId => ({
              serviceId,
            })),
          },
        },
        include: {
          user: true,
          services: {
            include: {
              service: true,
            },
          },
        },
      })

      // If any service requires payment, create payment record
      if (requiresPayment) {
        // Generate unique transaction ID
        const timestamp = Date.now()
        const randomSuffix = Math.random().toString().substring(2, 8)
        const transactionId = `${booking.id}${timestamp}${randomSuffix}`

        // Create payment record
        const payment = await tx.payment.create({
          data: {
            bookingId: booking.id,
            provider: paymentProvider,
            transactionId,
            amount: totalPrice,
            status: 'PENDING',
          },
        })

        return {
          booking,
          payment,
          requiresPayment: true,
          transactionId,
        }
      }

      return {
        booking,
        payment: null,
        requiresPayment: false,
        transactionId: null,
      }
    })

    return {
      success: true,
      booking: result.booking,
      payment: result.payment,
      requiresPayment: result.requiresPayment,
      transactionId: result.transactionId,
    }
  } catch (error) {
    console.error('Error creating booking with payment:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Get booking details
export async function getBookingDetails(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        services: {
          include: {
            service: true,
          },
        },
        business: true,
        payment: true,
      },
    })

    return { success: true, booking }
  } catch (error) {
    console.error('Error getting booking details:', error)
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
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true,
              },
            },
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
        services: {
          include: {
            service: true,
          },
        },
        business: true,
      },
    })
    return { success: true, booking }
  } catch (error) {
    console.error('Error fetching booking:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Get all availabilities for a business
export async function getBusinessAvailabilities(businessId: string) {
  try {
    const availabilities = await prisma.availability.findMany({
      where: { businessId },
      orderBy: {
        dayOfWeek: 'asc',
      },
    })
    return { success: true, availabilities }
  } catch (error) {
    console.error('Error fetching availabilities:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Update all availabilities for a business at once
export async function updateBusinessAvailabilities(
  businessId: string,
  availabilities: Array<{
    dayOfWeek: string
    startTime: string
    endTime: string
    isActive: boolean
  }>
) {
  try {
    // Delete existing availabilities for this business
    await prisma.availability.deleteMany({
      where: { businessId },
    })

    // Create new availabilites
    const created = await prisma.availability.createMany({
      data: availabilities.map((a) => ({
        businessId,
        dayOfWeek: a.dayOfWeek as any,
        startTime: a.startTime,
        endTime: a.endTime,
        isActive: a.isActive,
      })),
    })

    return { success: true, count: created.count }
  } catch (error) {
    console.error('Error updating availabilities:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Get count of pending bookings for all user's businesses
export async function getPendingBookingsCountForUser(userId: string) {
  try {
    const user = await getUserFromRequest()
    if (!user || user.id !== userId) {
      return { success: false, error: 'Unauthorized', count: 0 }
    }

    // Get all businesses for this user
    const businesses = await prisma.business.findMany({
      where: { ownerId: userId },
      select: { id: true },
    })

    if (businesses.length === 0) {
      return { success: true, count: 0 }
    }

    const businessIds = businesses.map((b) => b.id)

    // Count pending bookings across all businesses
    const pendingCount = await prisma.booking.count({
      where: {
        businessId: { in: businessIds },
        status: 'PENDING',
      },
    })

    return { success: true, count: pendingCount }
  } catch (error) {
    console.error('Error fetching pending bookings count:', error)
    return { success: false, error: (error as Error).message, count: 0 }
  }
}

// Get notifications for user based on recent bookings
export async function getNotificationsForUser(userId: string) {
  try {
    const user = await getUserFromRequest()
    if (!user || user.id !== userId) {
      return { success: false, error: 'Unauthorized', notifications: [] }
    }

    // Get all businesses for this user
    const businesses = await prisma.business.findMany({
      where: { ownerId: userId },
      select: { id: true },
    })

    if (businesses.length === 0) {
      return { success: true, notifications: [] }
    }

    const businessIds = businesses.map((b) => b.id)

    // Get recent bookings (last 24 hours for pending, or recent confirmed)
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const recentBookings = await prisma.booking.findMany({
      where: {
        businessId: { in: businessIds },
        OR: [
          { status: 'PENDING' },
          {
            status: 'CONFIRMED',
            updatedAt: { gte: twentyFourHoursAgo },
          },
        ],
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        services: {
          include: {
            service: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    interface Notification {
      id: string
      title: string
      description: string
      timestamp: string
      read: boolean
    }

    const notifications: Notification[] = recentBookings.map((booking) => {
      const serviceNames = booking.services.map((s) => s.service.name).join(', ')
      const customerName = booking.user.name || booking.user.email

      if (booking.status === 'PENDING') {
        return {
          id: booking.id,
          title: 'Lịch hẹn mới',
          description: `${customerName} đã đặt lịch ${serviceNames}`,
          timestamp: formatTimeAgo(booking.createdAt),
          read: false,
        }
      } else {
        return {
          id: booking.id,
          title: 'Lịch hẹn được xác nhận',
          description: `${customerName} - ${serviceNames}`,
          timestamp: formatTimeAgo(booking.updatedAt),
          read: true,
        }
      }
    })

    return { success: true, notifications }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { success: false, error: (error as Error).message, notifications: [] }
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Vừa xong'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`
  return date.toLocaleDateString('vi-VN')
}