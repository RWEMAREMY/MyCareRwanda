export type AuthRole = 'client' | 'hospital-caretaker' | 'children-caretaker' | 'admin'

export interface User {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  profileImageUrl?: string
  passwordHash: string
  passwordSalt: string
  role: AuthRole
  createdAt: string
  updatedAt: string
}
