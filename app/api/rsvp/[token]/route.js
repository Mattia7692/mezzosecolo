import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { token } = params

    const guest = await prisma.guest.findUnique({
      where: { token },
      select: {
        id: true,
        name: true,
        rsvpStatus: true,
        partySize: true,
        rsvpAt: true,
      },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 404 })
    }

    return NextResponse.json(guest)
  } catch (error) {
    console.error('GET /api/rsvp/[token] error:', error)
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { token } = params
    const { status, partySize } = await request.json()

    if (!['attending', 'not_attending'].includes(status)) {
      return NextResponse.json({ error: 'Status non valido' }, { status: 400 })
    }

    const guest = await prisma.guest.findUnique({ where: { token } })

    if (!guest) {
      return NextResponse.json({ error: 'Token non valido' }, { status: 404 })
    }

    const updated = await prisma.guest.update({
      where: { token },
      data: {
        rsvpStatus: status,
        partySize: status === 'attending' && partySize >= 1 ? partySize : 1,
        rsvpAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        rsvpStatus: true,
        partySize: true,
        rsvpAt: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('POST /api/rsvp/[token] error:', error)
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
