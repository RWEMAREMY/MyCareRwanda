import crypto from 'crypto'

type PasswordResetEntry = {
  email: string
  otp: string
  expiresAt: number
}

const OTP_TTL_MS = 10 * 60 * 1000
const store = new Map<string, PasswordResetEntry>()

const makeStoreKey = (email: string) => email.trim().toLowerCase()

export const createPasswordResetOtp = (email: string) => {
  const otp = String(crypto.randomInt(100000, 1000000))
  const key = makeStoreKey(email)
  const expiresAt = Date.now() + OTP_TTL_MS
  store.set(key, { email: key, otp, expiresAt })

  return {
    otp,
    expiresAt,
  }
}

export const verifyPasswordResetOtp = (email: string, otp: string) => {
  const key = makeStoreKey(email)
  const entry = store.get(key)
  if (!entry) return false
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return false
  }
  return entry.otp === otp
}

export const clearPasswordResetOtp = (email: string) => {
  store.delete(makeStoreKey(email))
}
