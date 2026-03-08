import "dotenv/config"
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './schema.prisma',
  // `db` field is not part of PrismaConfig but kept for backwards compatibility
  // @ts-ignore
  db: {
    url: process.env.DATABASE_URL,
  },
})