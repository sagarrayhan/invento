import { NextRequest, NextResponse } from 'next/server'
import { AuthUser, User } from '@/app/data/types'
import { AUTH_COOKIE_NAME, signAuthToken } from '@/lib/auth'

const DATABASE_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL

export async function POST(req: NextRequest) {
  try {
    if (!DATABASE_URL) {
      return NextResponse.json({ error: 'Database URL is not configured.' }, { status: 500 })
    }

    const body = await req.json()
    const id = String(body?.id || '').trim()
    const password = String(body?.password || '')

    if (!id || !password) {
      return NextResponse.json({ error: 'Id and password are required.' }, { status: 400 })
    }

    const userRes = await fetch(`${DATABASE_URL}/inventory/users/${encodeURIComponent(id)}.json`, {
      cache: 'no-store',
    })

    if (!userRes.ok) {
      return NextResponse.json({ error: 'Unable to fetch user.' }, { status: 500 })
    }

    const user = (await userRes.json()) as User | null
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      designation: user.designation,
      imageUrl: user.imageUrl,
      joinedAt: user.joinedAt,
    }

    const token = signAuthToken(authUser)
    const res = NextResponse.json({ user: authUser })
    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
