import { seedUsers } from '../seeders/userSeeder'
import { User } from '../types/auth'

export const users: User[] = seedUsers()
