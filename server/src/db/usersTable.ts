import { getUsersCollection } from './mongodb'

export const ensureUsersTable = async () => {
  const users = await getUsersCollection()
  await users.createIndex({ email: 1 }, { unique: true })
  await users.createIndex({ phoneNumber: 1 }, { unique: true })
}
