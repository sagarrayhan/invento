import crypto from 'crypto'
import { AuthUser } from '@/app/data/types'

type TokenPayload = {
  sub: string
  user: AuthUser
  exp: number
  iat: number
}

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7
export const AUTH_COOKIE_NAME = 'invento_auth'

function getSecret() {
  return process.env.JWT_SECRET || 'dev-only-invento-jwt-secret-change-me'
}

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString('base64url')
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, 'base64url').toString('utf8')
}

function signPart(part: string) {
  return crypto.createHmac('sha256', getSecret()).update(part).digest('base64url')
}

export function signAuthToken(user: AuthUser, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + ttlSeconds
  const payload: TokenPayload = { sub: user.id, user, iat, exp }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signature = signPart(signingInput)

  return `${signingInput}.${signature}`
}

export function verifyAuthToken(token: string): AuthUser | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [encodedHeader, encodedPayload, signature] = parts
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const expectedSignature = signPart(signingInput)

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as TokenPayload
    const now = Math.floor(Date.now() / 1000)
    if (!payload.exp || payload.exp < now) return null
    return payload.user
  } catch {
    return null
  }
}
