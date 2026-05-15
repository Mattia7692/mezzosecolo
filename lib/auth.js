import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session'
const MAX_AGE = 60 * 60 * 8 // 8 hours

export function isAuthenticated(request) {
  const cookie = request.cookies.get(COOKIE_NAME)
  if (!cookie) return false
  return cookie.value === process.env.ADMIN_SECRET
}

export function setAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, process.env.ADMIN_SECRET, {
    httpOnly: true,
    path: '/',
    maxAge: MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}

export function clearAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  })
  return response
}
