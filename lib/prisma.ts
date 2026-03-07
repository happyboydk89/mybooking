import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

// Create a new pool instance
const pool = new Pool({ connectionString })

// Create the Prisma Client with the adapter
const adapter = new PrismaPg(pool)
const prisma = new (PrismaClient as any)({ adapter })

const globalForPrisma = globalThis as unknown as {
  prisma: any
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }