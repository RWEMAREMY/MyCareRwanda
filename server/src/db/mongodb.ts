import { Collection, Db, MongoClient } from 'mongodb'
import { User } from '../types/auth'

const MONGODB_URI = process.env.MONGODB_URI || ''
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'mycarerwanda'

if (!MONGODB_URI) {
  console.warn('[boot] MONGODB_URI is not set. Database initialization will fail until it is provided.')
}

let mongoClient: MongoClient | null = null
let mongoDb: Db | null = null

const createClient = () => new MongoClient(MONGODB_URI)

export const getMongoDb = async () => {
  if (mongoDb) return mongoDb

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required.')
  }

  mongoClient = createClient()
  await mongoClient.connect()
  mongoDb = mongoClient.db(MONGODB_DB_NAME)
  return mongoDb
}

export const getUsersCollection = async (): Promise<Collection<User>> => {
  const db = await getMongoDb()
  return db.collection<User>('users')
}

export const closeMongoConnection = async () => {
  if (mongoClient) {
    await mongoClient.close()
    mongoClient = null
    mongoDb = null
  }
}
