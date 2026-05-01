import { pool } from '../db/postgres'
import { User } from '../types/auth'

const mapRowToUser = (row: any): User => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  phoneNumber: row.phone_number,
  passwordHash: row.password_hash,
  passwordSalt: row.password_salt,
  role: row.role,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
})

export const findUserByEmailOrPhone = async (email: string, phoneNumber: string) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1 OR phone_number = $2 LIMIT 1`,
    [email || '__none__', phoneNumber || '__none__'],
  )

  if (result.rows.length === 0) return null
  return mapRowToUser(result.rows[0])
}

export const findUserByEmail = async (email: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = $1 LIMIT 1`, [email])
  if (result.rows.length === 0) return null
  return mapRowToUser(result.rows[0])
}

export const findUserByPhoneNumber = async (phoneNumber: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE phone_number = $1 LIMIT 1`, [phoneNumber])
  if (result.rows.length === 0) return null
  return mapRowToUser(result.rows[0])
}

export const createUser = async (user: User) => {
  await pool.query(
    `
      INSERT INTO users (
        id,
        full_name,
        email,
        phone_number,
        password_hash,
        password_salt,
        role,
        created_at,
        updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `,
    [
      user.id,
      user.fullName,
      user.email,
      user.phoneNumber,
      user.passwordHash,
      user.passwordSalt,
      user.role,
      user.createdAt,
      user.updatedAt,
    ],
  )

  return user
}

export const findUserById = async (id: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [id])
  if (result.rows.length === 0) return null
  return mapRowToUser(result.rows[0])
}
