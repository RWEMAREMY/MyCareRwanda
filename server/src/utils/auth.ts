import crypto from 'crypto'
import { User } from '../types/auth'

export const authRoles = new Set(['client', 'hospital-caretaker', 'children-caretaker'])
export const PHONE_REGEX = /^[0-9]{10,15}$/
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

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
