import { User } from '../types/auth'
import { hashPassword } from '../utils/auth'

export const seedUsers = (): User[] => {
  const now = new Date().toISOString()
  const { hash, salt } = hashPassword('admin123')

  return [
    {
      id: '7f7d8e91-2e59-4b54-82c5-0f8be6e11a11',
      fullName: 'Platform Admin',
      email: 'admin@mycarerwanda.com',
      phoneNumber: '0788000000',
      passwordHash: hash,
      passwordSalt: salt,
      role: 'admin',
      createdAt: now,
      updatedAt: now,
    },
  ]
}
