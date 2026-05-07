import crypto from 'crypto'
import { Request, Response } from 'express'
import { createUser, findUserByEmailOrPhone } from '../data/userRepository'
import { User } from '../types/auth'
import {
  EMAIL_REGEX,
  hashPassword,
  issueAccessToken,
  normalizeEmail,
  normalizePhone,
  PASSWORD_REGEX,
  PHONE_REGEX,
} from '../utils/auth'

export const registerController = async (req: Request, res: Response) => {
  const fullName = String(req.body?.fullName || '').trim()
  const email = normalizeEmail(String(req.body?.email || ''))
  const phoneNumber = normalizePhone(String(req.body?.phoneNumber || ''))
  const password = String(req.body?.password || '').trim()
  const confirmPassword = String(req.body?.confirmPassword || '').trim()
  const validationErrors: string[] = []
  const fieldErrors: Record<string, string> = {}

  if (!fullName) {
    validationErrors.push('fullName is required.')
    fieldErrors.fullName = 'Full name is required.'
  }
  if (!email) {
    validationErrors.push('email is required.')
    fieldErrors.email = 'Email is required.'
  }
  if (!phoneNumber) {
    validationErrors.push('phoneNumber is required.')
    fieldErrors.phoneNumber = 'Phone number is required.'
  }
  if (!password) {
    validationErrors.push('password is required.')
    fieldErrors.password = 'Password is required.'
  }
  if (!confirmPassword) {
    validationErrors.push('confirmPassword is required.')
    fieldErrors.confirmPassword = 'Please re-type your password.'
  }

  if (fullName.length > 120) {
    validationErrors.push('fullName cannot exceed 120 characters.')
    fieldErrors.fullName = 'Full name cannot exceed 120 characters.'
  }
  if (email && !EMAIL_REGEX.test(email)) {
    validationErrors.push('email must be a valid email address.')
    fieldErrors.email = 'Enter a valid email address.'
  }
  if (phoneNumber && !PHONE_REGEX.test(phoneNumber)) {
    validationErrors.push('phoneNumber must contain only digits and be 10 to 15 characters.')
    fieldErrors.phoneNumber = 'Use Rwanda prefixes 072/073/078/079 or +25072/+25073/+25078/+25079.'
  }
  if (password && !PASSWORD_REGEX.test(password)) {
    validationErrors.push('password must be 8-72 chars and include at least one letter and one number.')
    fieldErrors.password = 'Use 8-72 chars with at least one letter and one number.'
  }
  if (password && confirmPassword && password !== confirmPassword) {
    validationErrors.push('password and confirmPassword do not match.')
    fieldErrors.confirmPassword = 'Passwords do not match.'
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: validationErrors,
      fieldErrors,
    })
  }

  const existingByEmail = await findUserByEmailOrPhone(email, '')
  const existingByPhone = await findUserByEmailOrPhone('', phoneNumber)

  if (existingByPhone?.phoneNumber === phoneNumber) {
    return res.status(409).json({
      message: 'An account with this phone number already exists.',
      fieldErrors: {
        phoneNumber: 'This phone number is already registered.',
      },
    })
  }

  if (existingByEmail?.email === email) {
    return res.status(409).json({
      message: 'An account with this email already exists.',
      fieldErrors: {
        email: 'This email is already registered.',
      },
    })
  }

  const { hash, salt } = hashPassword(password)
  const nowIso = new Date().toISOString()

  const newUser: User = {
    id: crypto.randomUUID(),
    fullName,
    email,
    phoneNumber,
    passwordHash: hash,
    passwordSalt: salt,
    role: 'client',
    createdAt: nowIso,
    updatedAt: nowIso,
  }

  try {
    await createUser(newUser)
  } catch (error: any) {
    if (error?.code === '23505' || error?.code === 11000) {
      return res.status(409).json({
        message: 'An account with this email or phone number already exists.',
        fieldErrors: {
          email: 'Email or phone number already exists.',
          phoneNumber: 'Email or phone number already exists.',
        },
      })
    }
    throw error
  }

  const token = issueAccessToken(newUser)

  return res.status(201).json({
    message: 'User registered successfully',
    data: {
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    },
  })
}
