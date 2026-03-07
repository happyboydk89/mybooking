import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

// Create a new pool instance
const pool = new Pool({ connectionString })

// Create the Prisma Client with the adapter
const adapter = new PrismaPg(pool)
const prisma = new (PrismaClient as any)({ adapter })

async function main() {
  console.log('🌱 Testing Supabase connection...')

  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Connected to Supabase successfully!')

    // Clear existing data (in correct order to avoid foreign key constraints)
    console.log('🧹 Clearing existing data...')
    await prisma.booking.deleteMany()
    await prisma.service.deleteMany()
    await prisma.availability.deleteMany()
    await prisma.business.deleteMany()
    await prisma.user.deleteMany()

    // Create 20 sample users (5 PROVIDER, 15 CUSTOMER)
    console.log('👥 Creating 20 sample users...')
    const providers = []
    const customers = []

    // Create 5 PROVIDER users
    for (let i = 1; i <= 5; i++) {
      const user = await prisma.user.create({
        data: {
          email: `provider${i}@example.com`,
          name: `Provider ${i}`,
          role: 'PROVIDER',
        },
      })
      providers.push(user)
      console.log(`✅ Created PROVIDER: ${user.email}`)
    }

    // Create 15 CUSTOMER users
    for (let i = 1; i <= 15; i++) {
      const user = await prisma.user.create({
        data: {
          email: `customer${i}@example.com`,
          name: `Customer ${i}`,
          role: 'CUSTOMER',
        },
      })
      customers.push(user)
      console.log(`✅ Created CUSTOMER: ${user.email}`)
    }

    // Create businesses for each provider
    console.log('🏢 Creating businesses...')
    const businesses = []
    const industryTypes = ['HAIR_SALON', 'CLINIC', 'SPA_MASSAGE'] as const

    for (const provider of providers) {
      const businessCount = Math.floor(Math.random() * 2) + 1 // 1-2 businesses per provider
      for (let i = 1; i <= businessCount; i++) {
        const industryType = industryTypes[Math.floor(Math.random() * industryTypes.length)]
        const business = await prisma.business.create({
          data: {
            name: `${provider.name}'s ${industryType.replace('_', ' ')} ${i}`,
            description: `A professional ${industryType.toLowerCase().replace('_', ' ')} service`,
            address: `123 Main St, City ${i}`,
            phone: `+1-555-0${Math.floor(Math.random() * 100).toString().padStart(2, '0')}-000${i}`,
            industryType,
            providerId: provider.id,
          },
        })
        businesses.push(business)
        console.log(`✅ Created business: ${business.name}`)
      }
    }

    // Create services for each business
    console.log('💼 Creating services...')
    const services = []
    const serviceTemplates = {
      HAIR_SALON: [
        { name: 'Hair Cut', price: 30, duration: 60 },
        { name: 'Hair Coloring', price: 80, duration: 120 },
        { name: 'Hair Wash', price: 20, duration: 30 },
        { name: 'Hair Styling', price: 40, duration: 45 },
        { name: 'Beard Trim', price: 15, duration: 20 },
      ],
      CLINIC: [
        { name: 'General Checkup', price: 100, duration: 30 },
        { name: 'Dental Cleaning', price: 150, duration: 60 },
        { name: 'Blood Test', price: 50, duration: 15 },
        { name: 'X-Ray', price: 200, duration: 20 },
        { name: 'Vaccination', price: 75, duration: 10 },
      ],
      SPA_MASSAGE: [
        { name: 'Swedish Massage', price: 90, duration: 60 },
        { name: 'Deep Tissue Massage', price: 110, duration: 75 },
        { name: 'Aromatherapy', price: 85, duration: 50 },
        { name: 'Hot Stone Massage', price: 120, duration: 90 },
        { name: 'Reflexology', price: 70, duration: 45 },
      ],
    }

    for (const business of businesses) {
      const templates = serviceTemplates[business.industryType as keyof typeof serviceTemplates]
      const serviceCount = Math.floor(Math.random() * 3) + 3 // 3-5 services per business
      for (let i = 0; i < serviceCount; i++) {
        const template = templates[i % templates.length]
        const service = await prisma.service.create({
          data: {
            name: template.name,
            description: `${template.name} service at ${business.name}`,
            price: template.price + Math.floor(Math.random() * 20), // Add some variation
            duration: template.duration,
            businessId: business.id,
          },
        })
        services.push(service)
        console.log(`✅ Created service: ${service.name} at ${business.name}`)
      }
    }

    // Create availabilities for each business (Mon-Fri, 9AM-5PM)
    console.log('📅 Creating availabilities...')
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const

    for (const business of businesses) {
      for (const day of daysOfWeek) {
        await prisma.availability.create({
          data: {
            businessId: business.id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            isActive: true,
          },
        })
      }
      console.log(`✅ Created availabilities for ${business.name}`)
    }

    // Create sample bookings
    console.log('📅 Creating sample bookings...')
    const statuses = ['PENDING', 'CONFIRMED', 'CANCELLED'] as const

    for (let i = 0; i < 50; i++) { // Create 50 bookings
      const customer = customers[Math.floor(Math.random() * customers.length)]
      const service = services[Math.floor(Math.random() * services.length)]
      const business = businesses.find(b => b.id === service.businessId)!

      // Random date within next 30 days
      const daysFromNow = Math.floor(Math.random() * 30) + 1
      const date = new Date()
      date.setDate(date.getDate() + daysFromNow)
      date.setHours(10 + Math.floor(Math.random() * 6), 0, 0, 0) // 10AM-4PM

      const status = statuses[Math.floor(Math.random() * statuses.length)]

      await prisma.booking.create({
        data: {
          userId: customer.id,
          businessId: business.id,
          serviceId: service.id,
          date,
          status,
          notes: status === 'CANCELLED' ? 'Customer cancelled' : 'Looking forward to the service',
        },
      })
    }
    console.log('✅ Created 50 sample bookings')

    // Verify data
    console.log('🔍 Verifying data...')
    const userCount = await prisma.user.count()
    const businessCount = await prisma.business.count()
    const serviceCount = await prisma.service.count()
    const availabilityCount = await prisma.availability.count()
    const bookingCount = await prisma.booking.count()

    console.log(`📊 Database summary:`)
    console.log(`   - Users: ${userCount} (5 PROVIDER, 15 CUSTOMER)`)
    console.log(`   - Businesses: ${businessCount}`)
    console.log(`   - Services: ${serviceCount}`)
    console.log(`   - Availabilities: ${availabilityCount}`)
    console.log(`   - Bookings: ${bookingCount}`)

    console.log('🎉 Seed completed successfully!')

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })