import crypto from 'crypto'
import { User } from '../types/auth'

export const authRoles = new Set(['client', 'hospital-caretaker', 'children-caretaker'])
// Rwanda mobile prefixes:
// local format: 072/073/078/079 + 7 digits
// intl format: +25072/+25073/+25078/+25079 + 7 digits
export const PHONE_REGEX = /^(?:\+?250|0)7(?:2|3|8|9)\d{7}$/
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,10}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'

const toBase64Url = (input: Buffer | string) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

const parseExpiresInSeconds = (value: string): number => {
  const normalized = value.trim().toLowerCase()
  const matched = normalized.match(/^(\d+)(s|m|h|d)?$/)
  if (!matched) return 7 * 24 * 60 * 60

  const amount = Number(matched[1])
  const unit = matched[2] || 's'

  const unitSeconds: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  }

  return amount * unitSeconds[unit]
}

export const hashPassword = (plainPassword: string, salt?: string) => {
  const passwordSalt = salt || crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(plainPassword, passwordSalt, 64)
  return {
    salt: passwordSalt,
    hash: hash.toString('hex'),
  }
}

export const verifyPassword = (plainPassword: string, storedHash: string, storedSalt: string) => {
  const { hash } = hashPassword(plainPassword, storedSalt)
  const incoming = Buffer.from(hash, 'hex')
  const existing = Buffer.from(storedHash, 'hex')

  if (incoming.length !== existing.length) return false
  return crypto.timingSafeEqual(incoming, existing)
}

export const normalizeEmail = (value: string) => value.trim().toLowerCase()
export const normalizePhone = (value: string) => value.trim().replace(/\s+/g, '')

export const issueAccessToken = (user: Pick<User, 'id' | 'email' | 'phoneNumber' | 'role'>) => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const exp = now + parseExpiresInSeconds(JWT_EXPIRES_IN)
  const payload = {
    sub: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    iat: now,
    exp,
  }

  const headerEncoded = toBase64Url(JSON.stringify(header))
  const payloadEncoded = toBase64Url(JSON.stringify(payload))
  const unsignedToken = `${headerEncoded}.${payloadEncoded}`

  const signature = crypto.createHmac('sha256', JWT_SECRET).update(unsignedToken).digest()
  const signedToken = `${unsignedToken}.${toBase64Url(signature)}`

  return {
    accessToken: signedToken,
    expiresAt: new Date(exp * 1000).toISOString(),
    expiresInSeconds: exp - now,
  }
}

type AccessTokenPayload = {
  sub: string
  email: string
  phoneNumber: string
  role: User['role']
  iat: number
  exp: number
}

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  const [headerEncoded, payloadEncoded, signatureEncoded] = token.split('.')
  if (!headerEncoded || !payloadEncoded || !signatureEncoded) return null

  const unsignedToken = `${headerEncoded}.${payloadEncoded}`
  const expectedSignature = toBase64Url(
    crypto.createHmac('sha256', JWT_SECRET).update(unsignedToken).digest(),
  )

  if (expectedSignature !== signatureEncoded) return null

  try {
    const payloadString = Buffer.from(payloadEncoded, 'base64url').toString('utf-8')
    const payload = JSON.parse(payloadString) as AccessTokenPayload
    if (!payload?.sub || !payload?.exp) return null
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
