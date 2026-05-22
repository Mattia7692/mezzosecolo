import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(guests)
  } catch (error) {
    console.error('GET /api/guests error:', error)
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, email, phone } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e email sono obbligatori' }, { status: 400 })
    }

    const guest = await prisma.guest.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), phone: phone?.trim() || '' },
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email già presente nella lista' }, { status: 409 })
    }
    console.error('POST /api/guests error:', error)
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
