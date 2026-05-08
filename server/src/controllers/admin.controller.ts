import { Request, Response } from 'express'
import { findUserById, listUsers, updateUserRole } from '../data/userRepository'
import { verifyAccessToken } from '../utils/auth'
import { AuthRole } from '../types/auth'

const allowedRoles: AuthRole[] = ['admin', 'client', 'hospital-caretaker', 'children-caretaker']

const extractBearerToken = (authHeader: string) => {
  const normalized = String(authHeader || '')
  return normalized.startsWith('Bearer ') ? normalized.slice(7).trim() : ''
}

const resolveAdminUser = async (req: Request, res: Response) => {
  const token = extractBearerToken(String(req.headers.authorization || ''))
  if (!token) {
    res.status(401).json({ message: 'Authorization token is required.' })
    return null
  }

  const payload = verifyAccessToken(token)
  if (!payload) {
    res.status(401).json({ message: 'Invalid or expired token.' })
    return null
  }

  const actor = await findUserById(payload.sub)
  if (!actor) {
    res.status(401).json({ message: 'User not found for token.' })
    return null
  }

  // Important: enforce admin role from DB, not stale token payload.
  if (actor.role !== 'admin') {
    res.status(403).json({ message: 'Admin access is required.' })
    return null
  }

  return actor
}

const sanitizeUser = (user: {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: AuthRole
  createdAt: string
  updatedAt: string
}) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

export const adminListUsersController = async (req: Request, res: Response) => {
  const actor = await resolveAdminUser(req, res)
  if (!actor) return

  const q = String(req.query.q || '').trim().toLowerCase()

  const users = await listUsers()
  const filteredUsers = q
    ? users.filter((user) => {
        const haystack = [user.fullName, user.email, user.phoneNumber, user.role]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    : users

  const sortedUsers = filteredUsers.sort((a, b) => {
    const byName = a.fullName.localeCompare(b.fullName)
    if (byName !== 0) return byName
    return a.email.localeCompare(b.email)
  })

  return res.json({
    message: 'Users fetched successfully.',
    data: sortedUsers.map(sanitizeUser),
    actor: sanitizeUser(actor),
  })
}

export const adminUpdateUserRoleController = async (req: Request, res: Response) => {
  const actor = await resolveAdminUser(req, res)
  if (!actor) return

  const userId = String(req.params.userId || '').trim()
  const role = String(req.body?.role || '').trim() as AuthRole

  if (!userId) {
    return res.status(400).json({ message: 'User id is required.' })
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: 'Invalid role.',
      allowedRoles,
    })
  }

  const targetUser = await findUserById(userId)
  if (!targetUser) {
    return res.status(404).json({ message: 'Target user not found.' })
  }

  const updatedUser = await updateUserRole(userId, role)

  if (!updatedUser) {
    return res.status(500).json({ message: 'Unable to update user role at this time.' })
  }

  return res.json({
    message: `Role updated to ${role}.`,
    data: sanitizeUser(updatedUser),
    actor: sanitizeUser(actor),
  })
}
