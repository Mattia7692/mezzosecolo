export function buildInviteEmail({ name, token, address, customText, eventDate, eventTime }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const rsvpUrl = `${baseUrl}/rsvp/${token}`

  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : null

  const mapsSection = mapsUrl
    ? `
      <div style="margin: 24px 0; text-align: center;">
        <a href="${mapsUrl}" style="display:inline-block; background-color:#2d2d4e; color:#c9a84c; text-decoration:none; padding:14px 32px; border-radius:6px; font-size:15px; font-family:Arial,sans-serif; border: 1px solid #c9a84c;">
          📍 Apri in Google Maps →
        </a>
      </div>
    `
    : ''

  const html = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mezzo Secolo — Invito</title>
</head>
<body style="margin:0; padding:0; background-color:#1a1a2e; font-family: Georgia, 'Times New Roman', serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e; padding: 40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#faf8f3; border-radius:12px; overflow:hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e; padding: 48px 40px 40px; text-align:center; border-bottom: 3px solid #c9a84c;">
              <p style="margin:0 0 8px; font-size:13px; letter-spacing:4px; color:#c9a84c; text-transform:uppercase; font-family: Arial, sans-serif;">Un invito speciale</p>
              <h1 style="margin:0 0 8px; font-size:52px; color:#faf8f3; font-weight:normal; letter-spacing:2px;">Mezzo Secolo</h1>
              <p style="margin:0; font-size:18px; color:#c9a84c; letter-spacing:1px;">50 anni di Mattia Baldini</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 48px;">

              <p style="margin:0 0 24px; font-size:20px; color:#2d2d2d;">Ciao <strong>${name}</strong>,</p>

              <div style="font-size:16px; line-height:1.8; color:#4a4a4a; margin-bottom:32px; white-space:pre-line;">${customText}</div>

              <!-- Divider -->
              <hr style="border:none; border-top:1px solid #e8e0d0; margin:32px 0;" />

              <!-- Event details -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:20px 24px; border-bottom:1px solid #f0ece4; background:#1a1a2e; border-radius:8px 8px 0 0;">
                    <p style="margin:0 0 4px; font-size:11px; letter-spacing:3px; color:#c9a84c; text-transform:uppercase; font-family:Arial,sans-serif;">Quando</p>
                    <p style="margin:0; font-size:22px; color:#faf8f3; font-weight:bold;">${eventDate || 'Giovedì 18 Giugno 2026'}</p>
                    <p style="margin:6px 0 0; font-size:18px; color:#c9a84c; font-weight:bold;">${eventTime || 'dalle ore 19:00 in poi'}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px; background:#2d2d4e; border-radius:0 0 8px 8px; margin-bottom:24px; display:block;">
                    <p style="margin:0 0 4px; font-size:11px; letter-spacing:3px; color:#c9a84c; text-transform:uppercase; font-family:Arial,sans-serif;">Dove</p>
                    <p style="margin:0; font-size:18px; color:#faf8f3; font-weight:bold;">${address || 'Luogo da definire'}</p>
                  </td>
                </tr>
              </table>

              ${mapsSection}

              <!-- RSVP Button -->
              <div style="text-align:center; margin:40px 0 24px;">
                <a href="${rsvpUrl}"
                   style="display:inline-block; background-color:#c9a84c; color:#1a1a2e; text-decoration:none; padding:18px 48px; border-radius:6px; font-size:17px; font-weight:bold; letter-spacing:1px; font-family:Arial,sans-serif;">
                  Conferma la tua presenza &rarr;
                </a>
              </div>

              <p style="text-align:center; font-size:13px; color:#9a9a9a; font-family:Arial,sans-serif; margin:0;">
                Oppure visita: <a href="${rsvpUrl}" style="color:#c9a84c;">${rsvpUrl}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f0ece4; padding:32px 48px; text-align:center; border-top:1px solid #e8e0d0;">
              <p style="margin:0 0 4px; font-size:16px; color:#4a4a4a; font-style:italic;">Con affetto,</p>
              <p style="margin:0; font-size:22px; color:#2d2d2d;">Mattia</p>
            </td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()

  return html
}
