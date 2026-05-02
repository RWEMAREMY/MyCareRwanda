import { Request, Response } from 'express'
import crypto from 'crypto'
import { findUserById } from '../data/userRepository'
import { createUser, findUserByEmail } from '../data/userRepository'
import { verifyAccessToken } from '../utils/auth'
import { issueAccessToken, normalizeEmail } from '../utils/auth'
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
  const googleClientId = String(process.env.GOOGLE_CLIENT_ID || '').trim()

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

  if (googleClientId && tokenInfo.aud !== googleClientId) {
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
