import 'dotenv/config'
import { ensureUsersTable } from '../db/usersTable'
import { getUsersCollection, closeMongoConnection } from '../db/mongodb'
import { seedUsers } from './userSeeder'

const runSeeders = async () => {
  const seededUsers = seedUsers()
  await ensureUsersTable()

  const users = await getUsersCollection()
  let upsertedCount = 0

  for (const user of seededUsers) {
    await users.updateOne(
      { email: user.email },
      {
        $set: {
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          passwordHash: user.passwordHash,
          passwordSalt: user.passwordSalt,
          role: user.role,
          updatedAt: user.updatedAt,
        },
        $setOnInsert: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
      { upsert: true },
    )
    upsertedCount += 1
  }

  console.log('Seeders executed successfully against MongoDB.')
  console.log(`Users upserted: ${upsertedCount}`)

  const allUsers = await users
    .find({}, { projection: { _id: 0, id: 1, email: 1, phoneNumber: 1, role: 1 } })
    .sort({ createdAt: 1 })
    .toArray()

  for (const row of allUsers) {
    console.log(`- ${row.id} | ${row.email} | ${row.phoneNumber} | ${row.role}`)
  }
}

runSeeders()
  .catch((error) => {
    console.error('Seeder failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeMongoConnection()
  })
