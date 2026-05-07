import { getUsersCollection } from '../db/mongodb'
import { User } from '../types/auth'

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
