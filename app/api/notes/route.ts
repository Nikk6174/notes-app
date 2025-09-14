import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const notes = await prisma.note.findMany({
      where: { tenantId: payload.tenantId },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(notes)

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: payload.tenantId }
    })

    if (tenant?.subscription === 'free') {
      const noteCount = await prisma.note.count({
        where: { tenantId: payload.tenantId }
      })

      if (noteCount >= 3) {
        return NextResponse.json(
          { error: 'Free plan limit reached. Upgrade to Pro for unlimited notes.' },
          { status: 403 }
        )
      }
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: payload.userId,
        tenantId: payload.tenantId
      },
      include: { user: { select: { email: true } } }
    })

    return NextResponse.json(note, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}