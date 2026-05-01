import { Request, Response } from 'express'

export const googleAuthController = (req: Request, res: Response) => {
  return res.json({
    message: 'Google login is ready on UI. OAuth integration endpoint is pending setup.',
  })
}