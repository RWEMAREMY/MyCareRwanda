import { Request, Response } from 'express'
import { findUserByEmail, findUserByPhoneNumber } from '../data/userRepository'
import { issueAccessToken, normalizeEmail, normalizePhone, verifyPassword } from '../utils/auth'

export const loginController = async (req: Request, res: Response) => {
  const email = normalizeEmail(String(req.body?.email || ''))
  const phoneNumber = normalizePhone(String(req.body?.phoneNumber || ''))
  const password = String(req.body?.password || '').trim()

  const fieldErrors: Record<string, string> = {}

  if ((!email && !phoneNumber) || !password) {
    if (!email && !phoneNumber) {
      fieldErrors.identifier = 'Provide your email or phone number.'
    }
    if (!password) {
      fieldErrors.password = 'Password is required.'
    }

    return res.status(400).json({
      message: 'Provide email or phoneNumber, and password.',
      fieldErrors,
    })
  }

  const user = email ? await findUserByEmail(email) : await findUserByPhoneNumber(phoneNumber)
  if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    return res.status(401).json({
      message: 'Invalid credentials.',
      fieldErrors: {
        identifier: 'Email/phone or password is incorrect.',
        password: 'Email/phone or password is incorrect.',
      },
    })
  }

  const token = issueAccessToken(user)

  return res.json({
    message: 'Login successful',
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
