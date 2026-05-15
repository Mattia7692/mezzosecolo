import { NextResponse } from 'next/server'

const COOKIE_NAME = 'admin_session'

function isAuthenticated(request) {
  const cookie = request.cookies.get(COOKIE_NAME)
  if (!cookie) return false
  return cookie.value === process.env.ADMIN_SECRET
}

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Public routes — always allowed
  const publicPatterns = [
    /^\/login/,
    /^\/api\/auth\//,
    /^\/rsvp\//,
    /^\/api\/rsvp\//,
    /^\/_next\//,
    /^\/favicon\.ico/,
  ]

  for (const pattern of publicPatterns) {
    if (pattern.test(pathname)) {
      return NextResponse.next()
    }
  }

  // Protected routes
  const protectedPatterns = [
    /^\/admin/,
    /^\/api\/guests/,
    /^\/api\/send/,
    /^\/api\/settings/,
  ]

  const isProtected = protectedPatterns.some((p) => p.test(pathname))

  if (isProtected && !isAuthenticated(request)) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
