import { createHmac, timingSafeEqual } from 'crypto'
import type { AuthUser } from '@/app/data/types'

export const AUTH_COOKIE_NAME = 'invento_auth'

type AuthPayload = {
  user: AuthUser
  exp: number
}

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV !== 'production') return 'invento-dev-secret'
  throw new Error('AUTH_SECRET is not configured.')
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
  return Buffer.from(normalized + padding, 'base64').toString('utf-8')
}

function sign(input: string) {
  return createHmac('sha256', getSecret()).update(input).digest('base64url')
}

export function signAuthToken(user: AuthUser) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64UrlEncode(
    JSON.stringify({
      user,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    } satisfies AuthPayload)
  )
  const signature = sign(`${header}.${payload}`)
  return `${header}.${payload}.${signature}`
}

export function verifyAuthToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, payload, signature] = parts
    const expected = sign(`${header}.${payload}`)

    const a = Buffer.from(signature)
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null

    const parsed = JSON.parse(base64UrlDecode(payload)) as Partial<AuthPayload>
    if (!parsed?.user || typeof parsed.exp !== 'number') return null
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null
    return parsed.user as AuthUser
  } catch {
    return null
  }
}
