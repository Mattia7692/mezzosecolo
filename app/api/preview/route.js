import { prisma } from '@/lib/prisma'
import { buildInviteEmail } from '@/lib/email'

export async function GET() {
  const settings = await prisma.settings.findUnique({ where: { id: 1 } })

  const html = buildInviteEmail({
    name: 'Mario Rossi',
    token: 'anteprima-token-000',
    address: settings?.address || 'Indirizzo da configurare nelle impostazioni',
    customText: settings?.customText || '[ Il testo dell\'invito verrà inserito qui ]',
    eventDate: settings?.eventDate || 'Giovedì 18 Giugno 2026',
    eventTime: settings?.eventTime || 'dalle ore 19:00 in poi',
  })

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
