import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { password } = await request.json()

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Password errata' }, { status: 401 })
    }

    const response = NextResponse.json({ ok: true })

    response.cookies.set('admin_session', process.env.ADMIN_SECRET, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Errore del server' }, { status: 500 })
  }
}
