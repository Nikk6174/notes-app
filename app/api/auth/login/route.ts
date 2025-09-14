import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = signToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    })

    return NextResponse.json({
      token,
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenant
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}