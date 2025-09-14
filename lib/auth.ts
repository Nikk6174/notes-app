import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  tenantId: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { tenant: true }
  })

  if (!user || !await comparePassword(password, user.password)) {
    return null
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenant: user.tenant
  }
}