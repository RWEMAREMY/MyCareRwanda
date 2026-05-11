import { getUsersCollection } from '../db/mongodb'
import { AuthRole, User } from '../types/auth'

const withoutMongoId = (doc: (User & { _id?: unknown }) | null): User | null => {
  if (!doc) return null
  const { _id: _ignored, ...user } = doc
  return user
}

export const findUserByEmailOrPhone = async (email: string, phoneNumber: string) => {
  const users = await getUsersCollection()
  const query: Record<string, unknown>[] = []

  if (email) query.push({ email })
  if (phoneNumber) query.push({ phoneNumber })
  if (query.length === 0) return null

  const result = await users.findOne({ $or: query })
  return withoutMongoId(result as User & { _id?: unknown })
}

export const findUserByEmail = async (email: string) => {
  const users = await getUsersCollection()
  const result = await users.findOne({ email })
  return withoutMongoId(result as User & { _id?: unknown })
}

export const findUserByPhoneNumber = async (phoneNumber: string) => {
  const users = await getUsersCollection()
  const result = await users.findOne({ phoneNumber })
  return withoutMongoId(result as User & { _id?: unknown })
}

export const createUser = async (user: User) => {
  const users = await getUsersCollection()
  await users.insertOne(user)
  return user
}

export const findUserById = async (id: string) => {
  const users = await getUsersCollection()
  const result = await users.findOne({ id })
  return withoutMongoId(result as User & { _id?: unknown })
}

export const listUsers = async () => {
  const users = await getUsersCollection()
  const rows = await users.find({}, { projection: { _id: 0 } }).toArray()
  return rows as User[]
}

export const updateUserRole = async (id: string, role: AuthRole) => {
  const users = await getUsersCollection()
  const updatedAt = new Date().toISOString()

  const result = await users.findOneAndUpdate(
    { id },
    { $set: { role, updatedAt } },
    { returnDocument: 'after', projection: { _id: 0 } },
  )

  return (result as User | null) || null
}

export const updateUserPassword = async (id: string, passwordHash: string, passwordSalt: string) => {
  const users = await getUsersCollection()
  const updatedAt = new Date().toISOString()

  const result = await users.findOneAndUpdate(
    { id },
    { $set: { passwordHash, passwordSalt, updatedAt } },
    { returnDocument: 'after', projection: { _id: 0 } },
  )

  return (result as User | null) || null
}

type UpdateUserProfileInput = {
  id: string
  fullName: string
  phoneNumber: string
  profileImageUrl?: string
}

export const updateUserProfile = async ({
  id,
  fullName,
  phoneNumber,
  profileImageUrl,
}: UpdateUserProfileInput) => {
  const users = await getUsersCollection()
  const updatedAt = new Date().toISOString()

  await users.updateOne(
    { id },
    {
      $set: {
        fullName,
        phoneNumber,
        profileImageUrl,
        updatedAt,
      },
    },
  )

  const refreshed = await users.findOne({ id }, { projection: { _id: 0 } })
  return (refreshed as User | null) || null
}
