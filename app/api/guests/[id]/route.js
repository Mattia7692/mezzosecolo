import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const { rsvpStatus, partySize } = await request.json()

    if (!['attending', 'not_attending', 'pending'].includes(rsvpStatus)) {
      return NextResponse.json({ error: 'Status non valido' }, { status: 400 })
    }

    const guest = await prisma.guest.update({
      where: { id },
      data: {
        rsvpStatus,
        partySize: rsvpStatus === 'attending' ? (partySize || 1) : 1,
        rsvpAt: rsvpStatus === 'pending' ? null : new Date(),
      },
    })

    return NextResponse.json(guest)
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Ospite non trovato' }, { status: 404 })
    }
    console.error('PATCH /api/guests/[id] error:', error)
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    await prisma.guest.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Ospite non trovato' }, { status: 404 })
    }
    console.error('DELETE /api/guests/[id] error:', error)
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
