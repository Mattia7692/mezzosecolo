import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
