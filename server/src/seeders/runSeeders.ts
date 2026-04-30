import 'dotenv/config'
import { pool } from '../db/postgres'
import { seedUsers } from './userSeeder'

const ensureUsersTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone_number TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `)
}

const runSeeders = async () => {
  const seededUsers = seedUsers()

  await ensureUsersTable()

  let upsertedCount = 0

  for (const user of seededUsers) {
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
        ON CONFLICT (email)
        DO UPDATE SET
          id = EXCLUDED.id,
          full_name = EXCLUDED.full_name,
          phone_number = EXCLUDED.phone_number,
          password_hash = EXCLUDED.password_hash,
          password_salt = EXCLUDED.password_salt,
          role = EXCLUDED.role,
          updated_at = EXCLUDED.updated_at;
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

    upsertedCount += 1
  }

  console.log('Seeders executed successfully against PostgreSQL.')
  console.log(`Users upserted: ${upsertedCount}`)

  const result = await pool.query(
    `SELECT id, email, phone_number AS "phoneNumber", role FROM users ORDER BY created_at ASC;`,
  )

  for (const row of result.rows) {
    console.log(`- ${row.id} | ${row.email} | ${row.phoneNumber} | ${row.role}`)
  }
}

runSeeders()
  .catch((error) => {
    console.error('Seeder failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
