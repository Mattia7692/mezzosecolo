import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
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
    return NextResponse.json(settings)
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { address, mapsEmbedUrl, customText } = await request.json()

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        address: address ?? '',
        mapsEmbedUrl: mapsEmbedUrl ?? '',
        customText: customText ?? '',
      },
      create: {
        id: 1,
        address: address ?? '',
        mapsEmbedUrl: mapsEmbedUrl ?? '',
        customText: customText ?? "[ Il testo dell'invito verrà inserito qui ]",
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('POST /api/settings error:', error)
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
