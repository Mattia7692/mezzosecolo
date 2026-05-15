import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { buildInviteEmail } from '@/lib/email'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    const { guestIds, all } = body

    // Fetch settings
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        address: '',
        mapsEmbedUrl: '',
        customText: "[ Il testo dell'invito verrà inserito qui ]",
      },
    })

    let guests = []

    if (all) {
      // Send to all not yet invited
      guests = await prisma.guest.findMany({
        where: { invitedAt: null },
      })
    } else if (Array.isArray(guestIds) && guestIds.length > 0) {
      guests = await prisma.guest.findMany({
        where: { id: { in: guestIds } },
      })
    } else {
      return NextResponse.json({ error: 'Specifica guestIds o all:true' }, { status: 400 })
    }

    if (guests.length === 0) {
      return NextResponse.json({ sent: 0, message: 'Nessun ospite da invitare' })
    }

    const results = []

    for (const guest of guests) {
      try {
        const html = buildInviteEmail({
          name: guest.name,
          token: guest.token,
          address: settings.address,
          mapsEmbedUrl: settings.mapsEmbedUrl,
          customText: settings.customText,
        })

        await resend.emails.send({
          from: 'Mattia Baldini <mattia@mail.mattiabaldini.com>',
          to: guest.email,
          subject: 'Sei invitato/a al mio Mezzo Secolo! 🎂',
          html,
        })

        await prisma.guest.update({
          where: { id: guest.id },
          data: { invitedAt: new Date() },
        })

        results.push({ id: guest.id, email: guest.email, status: 'sent' })
      } catch (err) {
        console.error(`Failed to send to ${guest.email}:`, err)
        results.push({ id: guest.id, email: guest.email, status: 'error', error: err.message })
      }
    }

    const sent = results.filter((r) => r.status === 'sent').length
    const failed = results.filter((r) => r.status === 'error').length

    return NextResponse.json({ sent, failed, results })
  } catch (error) {
    console.error('POST /api/send error:', error)
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
