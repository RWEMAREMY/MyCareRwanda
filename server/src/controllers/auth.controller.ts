import { Request, Response } from 'express'
import { findUserById } from '../data/userRepository'
import { verifyAccessToken } from '../utils/auth'
import { loginController } from './login.controller'
import { registerController } from './register.controller'

export const authRegisterController = (req: Request, res: Response) => registerController(req, res)

// This is the dedicated login controller for /api/auth/login.
export const authLoginController = (req: Request, res: Response) => loginController(req, res)

export const googleAuthController = (_req: Request, res: Response) => {
  return res.json({
    message: 'Google login is ready on UI. OAuth integration endpoint is pending setup.',
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
