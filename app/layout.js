import './globals.css'

export const metadata = {
  title: 'Mezzo Secolo',
  description: 'Invito al 50° compleanno di Mattia',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
