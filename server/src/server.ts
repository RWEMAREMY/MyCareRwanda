import 'dotenv/config'
import express from 'express'
import { authLoginController, authRegisterController, googleAuthController } from './controllers/auth.controller'
import { listCareCategoriesController, listCaregiversController } from './controllers/care.controller'
import { instantCareRequestController } from './controllers/request.controller'
import { ensureUsersTable } from './db/usersTable'

const app = express()
const PORT = process.env.PORT || 5000
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const isAllowedOrigin = (origin?: string) => {
  if (!origin) return true
  if (allowedOrigins.length === 0) return true
  if (allowedOrigins.includes(origin)) return true

  // Always allow localhost variants for local development.
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true

  return false
}

app.use(express.json())

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin

  if (requestOrigin && isAllowedOrigin(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')

  if (req.method === 'OPTIONS') {
    return res.status(204).send()
  }

  next()
})

app.get('/', (_req, res) => {
  res.json({ message: 'MyCareRwanda backend is running' })
})

app.get('/api/care-categories', listCareCategoriesController)
app.get('/api/caregivers', listCaregiversController)

app.post('/api/auth/register', authRegisterController)
app.post('/api/auth/login', authLoginController)
app.post('/api/auth/google', googleAuthController)

app.post('/api/requests/instant-care', instantCareRequestController)

const startServer = async () => {
  await ensureUsersTable()

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
