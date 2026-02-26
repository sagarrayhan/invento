import { NextRequest, NextResponse } from 'next/server'
import { AUTH_COOKIE_NAME, verifyAuthToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const user = verifyAuthToken(token)
  if (!user) {
    const res = NextResponse.json({ user: null }, { status: 401 })
    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: '',
      path: '/',
      maxAge: 0,
    })
    return res
  }

  return NextResponse.json({ user })
}
