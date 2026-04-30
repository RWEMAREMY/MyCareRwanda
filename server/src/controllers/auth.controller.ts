import { Request, Response } from 'express'
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
