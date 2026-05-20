import { prisma } from '@/lib/prisma'
import { buildInviteEmail } from '@/lib/email'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const settings = await prisma.settings.findUnique({ where: { id: 1 } })

  const html = buildInviteEmail({
    name: 'Mario Rossi',
    token: 'anteprima-token-000',
    address: searchParams.get('address') ?? settings?.address ?? 'Indirizzo da configurare nelle impostazioni',
    customText: searchParams.get('customText') ?? settings?.customText ?? '[ Il testo dell\'invito verrà inserito qui ]',
    eventDate: searchParams.get('eventDate') ?? settings?.eventDate ?? 'Giovedì 18 Giugno 2026',
    eventTime: searchParams.get('eventTime') ?? settings?.eventTime ?? 'dalle ore 19:00 in poi',
  })

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
