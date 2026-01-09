import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL

  if (!url) return undefined

  // Force pgbouncer=true if not present (Crucial for Supabase Transaction Pooler)
  if (!url.includes('pgbouncer=true')) {
    const separator = url.includes('?') ? '&' : '?'
    url = `${url}${separator}pgbouncer=true`
  }

  // Ensure connection limit is manageable for serverless
  // If connection_limit is not set, append it
  if (!url.includes('connection_limit=')) {
    const separator = url.includes('?') ? '&' : '?'
    // Use slightly higher limit for Pooler (e.g., 3) vs Direct (1)
    url = `${url}${separator}connection_limit=3`
  }

  return url
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
