
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { verifyToken } from './token'
import { prisma } from './prisma'

const TOKEN_NAME = 'token'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

export async function clearTokenCookie() {
  const cookieStore = await cookies()
  cookieStore.set({
    name: TOKEN_NAME,
    value: '',
    maxAge: 0,
    path: '/',
  })
}

export async function getUserFromRequest(): Promise<any | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  return user
}

export async function registerUser(email: string, password: string) {
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { success: false, error: 'Email already exists' }
    }
    const hashed = await hashPassword(password)
    const user = await prisma.user.create({
      data: { email, password: hashed },
    })
    return { success: true, user }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return null
  }
  const valid = await verifyPassword(password, user.password)
  if (!valid) return null
  return user
}
