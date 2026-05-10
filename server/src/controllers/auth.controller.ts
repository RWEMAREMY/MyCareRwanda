import { Request, Response } from 'express'
import crypto from 'crypto'
import { findUserById } from '../data/userRepository'
import { createUser, findUserByEmail } from '../data/userRepository'
import { updateUserPassword } from '../data/userRepository'
import { sendPasswordResetOtpEmail } from '../utils/mailer'
import { verifyAccessToken } from '../utils/auth'
import { hashPassword, issueAccessToken, normalizeEmail, PASSWORD_REGEX, verifyPassword } from '../utils/auth'
import { clearPasswordResetOtp, createPasswordResetOtp, verifyPasswordResetOtp } from '../utils/passwordReset'
import { loginController } from './login.controller'
import { registerController } from './register.controller'

export const authRegisterController = (req: Request, res: Response) => registerController(req, res)

// This is the dedicated login controller for /api/auth/login.
export const authLoginController = (req: Request, res: Response) => loginController(req, res)

type GoogleTokenInfo = {
  aud?: string
  email?: string
  email_verified?: string | boolean
  name?: string
  sub?: string
}

const normalizeGoogleEmailVerified = (value: GoogleTokenInfo['email_verified']) =>
  value === true || String(value).toLowerCase() === 'true'

const createGooglePlaceholderPhone = (googleSub: string) => `google-${googleSub}`

export const googleAuthController = async (req: Request, res: Response) => {
  const idToken = String(req.body?.idToken || '').trim()
  const allowedAudiences = Array.from(
    new Set(
      [
        process.env.GOOGLE_CLIENT_ID,
        process.env.VITE_GOOGLE_CLIENT_ID,
        ...(process.env.GOOGLE_CLIENT_IDS || '').split(','),
      ]
        .map((value) => String(value || '').trim())
        .filter(Boolean),
    ),
  )

  if (!idToken) {
    return res.status(400).json({
      message: 'Google ID token is required.',
      fieldErrors: { google: 'Google sign-in token is required.' },
    })
  }

  let tokenInfo: GoogleTokenInfo

  try {
    const tokenInfoResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    )
    if (!tokenInfoResponse.ok) {
      return res.status(401).json({ message: 'Invalid Google token.' })
    }
    tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfo
  } catch {
    return res.status(503).json({ message: 'Unable to verify Google token right now.' })
  }

  if (allowedAudiences.length > 0 && !allowedAudiences.includes(String(tokenInfo.aud || ''))) {
    return res.status(401).json({ message: 'Google token audience mismatch.' })
  }

  const email = normalizeEmail(String(tokenInfo.email || ''))
  const googleSub = String(tokenInfo.sub || '').trim()
  const isEmailVerified = normalizeGoogleEmailVerified(tokenInfo.email_verified)

  if (!email || !googleSub || !isEmailVerified) {
    return res.status(401).json({ message: 'Google account email is missing or not verified.' })
  }

  let user = await findUserByEmail(email)

  if (!user) {
    const nowIso = new Date().toISOString()
    const passwordHash = crypto.randomBytes(64).toString('hex')
    const passwordSalt = crypto.randomBytes(16).toString('hex')

    user = await createUser({
      id: crypto.randomUUID(),
      fullName: String(tokenInfo.name || email.split('@')[0] || 'Google User').slice(0, 120),
      email,
      phoneNumber: createGooglePlaceholderPhone(googleSub),
      passwordHash,
      passwordSalt,
      role: 'client',
      createdAt: nowIso,
      updatedAt: nowIso,
    })
  }

  if (!user) {
    return res.status(500).json({ message: 'Unable to create or load Google user.' })
  }

  const token = issueAccessToken(user)

  return res.json({
    message: 'Google login successful',
    data: {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  })
}

export const authMeController = async (req: Request, res: Response) => {
  const authHeader = String(req.headers.authorization || '')
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required.' })
  }

  const payload = verifyAccessToken(token)
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }

  const user = await findUserById(payload.sub)
  if (!user) {
    return res.status(401).json({ message: 'User not found for token.' })
  }

  return res.json({
    message: 'User fetched successfully',
    data: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      createdAt: user.createdAt,
    },
  })
}

export const authChangePasswordController = async (req: Request, res: Response) => {
  const authHeader = String(req.headers.authorization || '')
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''
  const currentPassword = String(req.body?.currentPassword || '').trim()
  const newPassword = String(req.body?.newPassword || '').trim()
  const confirmPassword = String(req.body?.confirmPassword || '').trim()
  const fieldErrors: Record<string, string> = {}

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required.' })
  }

  const payload = verifyAccessToken(token)
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }

  if (!currentPassword) fieldErrors.currentPassword = 'Current password is required.'
  if (!newPassword) fieldErrors.newPassword = 'New password is required.'
  if (!confirmPassword) fieldErrors.confirmPassword = 'Please re-type your new password.'
  if (newPassword && !PASSWORD_REGEX.test(newPassword)) {
    fieldErrors.newPassword = 'Use 8-72 chars with at least one letter and one number.'
  }
  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    fieldErrors.confirmPassword = 'New password and confirmation do not match.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return res.status(400).json({
      message: 'Validation failed.',
      fieldErrors,
    })
  }

  const user = await findUserById(payload.sub)
  if (!user) {
    return res.status(401).json({ message: 'User not found for token.' })
  }

  if (!verifyPassword(currentPassword, user.passwordHash, user.passwordSalt)) {
    return res.status(401).json({
      message: 'Current password is incorrect.',
      fieldErrors: {
        currentPassword: 'Current password is incorrect.',
      },
    })
  }

  const { hash, salt } = hashPassword(newPassword)
  await updateUserPassword(user.id, hash, salt)

  return res.json({
    message: 'Password changed successfully.',
  })
}

export const authForgotPasswordRequestController = async (req: Request, res: Response) => {
  const email = normalizeEmail(String(req.body?.email || ''))

  if (!email) {
    return res.status(400).json({
      message: 'Email is required.',
      fieldErrors: {
        email: 'Email is required.',
      },
    })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      message: 'Invalid email.',
      fieldErrors: {
        email: 'Enter a valid email address.',
      },
    })
  }

  const user = await findUserByEmail(email)
  if (user) {
    const { otp } = createPasswordResetOtp(email)
    await sendPasswordResetOtpEmail(email, otp)
  }

  return res.json({
    message: 'If the email exists, we sent an OTP code.',
  })
}

export const authForgotPasswordResetController = async (req: Request, res: Response) => {
  const email = normalizeEmail(String(req.body?.email || ''))
  const otp = String(req.body?.otp || '').trim()
  const newPassword = String(req.body?.newPassword || '').trim()
  const confirmPassword = String(req.body?.confirmPassword || '').trim()
  const fieldErrors: Record<string, string> = {}

  if (!email) fieldErrors.email = 'Email is required.'
  if (!otp) fieldErrors.otp = 'OTP code is required.'
  if (!newPassword) fieldErrors.newPassword = 'New password is required.'
  if (!confirmPassword) fieldErrors.confirmPassword = 'Please re-type your new password.'
  if (newPassword && !PASSWORD_REGEX.test(newPassword)) {
    fieldErrors.newPassword = 'Use 8-72 chars with at least one letter and one number.'
  }
  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    fieldErrors.confirmPassword = 'New password and confirmation do not match.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    return res.status(400).json({
      message: 'Validation failed.',
      fieldErrors,
    })
  }

  const user = await findUserByEmail(email)
  if (!user) {
    return res.status(400).json({
      message: 'Invalid email or OTP.',
      fieldErrors: {
        email: 'Invalid email or OTP.',
        otp: 'Invalid email or OTP.',
      },
    })
  }

  const isValidOtp = verifyPasswordResetOtp(email, otp)
  if (!isValidOtp) {
    return res.status(400).json({
      message: 'Invalid or expired OTP.',
      fieldErrors: {
        otp: 'Invalid or expired OTP.',
      },
    })
  }

  const { hash, salt } = hashPassword(newPassword)
  await updateUserPassword(user.id, hash, salt)
  clearPasswordResetOtp(email)

  return res.json({
    message: 'Password reset successful. You can sign in now.',
  })
}
