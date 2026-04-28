import 'dotenv/config'
import express from 'express'

const app = express()
const PORT = process.env.PORT || 5000
const ALLOWED_ORIGIN = process.env.CLIENT_ORIGIN || '*'

type CareCategory =
  | 'child-care'
  | 'adult-care'
  | 'home-care'
  | 'hospital-caretaker'
  | 'instant-care'

interface Caregiver {
  id: string
  name: string
  category: CareCategory
  district: string
  languages: string[]
  ratePerHour: number
  verified: boolean
  instantAvailable: boolean
}

interface User {
  id: string
  fullName: string
  email?: string
  phoneNumber: string
  password: string
  role: 'client' | 'hospital-caretaker' | 'children-caretaker' | 'admin'
  createdAt: string
}

const careCategories: Array<{ value: CareCategory; label: string; description: string }> = [
  {
    value: 'child-care',
    label: 'Child Care',
    description: 'Babysitters and daily caregivers for children and school routines.',
  },
  {
    value: 'adult-care',
    label: 'Adult Care',
    description: 'Compassionate support for adults needing regular assistance.',
  },
  {
    value: 'home-care',
    label: 'Home Care',
    description: 'In-home caretaker support for loved ones in familiar surroundings.',
  },
  {
    value: 'hospital-caretaker',
    label: 'Hospital Caretaker',
    description: 'On-site attendants for hospital stays and shift overlap support.',
  },
  {
    value: 'instant-care',
    label: 'Instant Care',
    description: 'Urgent same-day caretaker support when schedules change unexpectedly.',
  },
]

const caregivers: Caregiver[] = [
  {
    id: 'cg-001',
    name: 'Aline Uwimana',
    category: 'child-care',
    district: 'Kigali',
    languages: ['Kinyarwanda', 'English'],
    ratePerHour: 3500,
    verified: true,
    instantAvailable: true,
  },
  {
    id: 'cg-002',
    name: 'Jean Claude Ndayisaba',
    category: 'adult-care',
    district: 'Huye',
    languages: ['Kinyarwanda', 'French'],
    ratePerHour: 4200,
    verified: true,
    instantAvailable: false,
  },
  {
    id: 'cg-003',
    name: 'Diane Mukamana',
    category: 'home-care',
    district: 'Musanze',
    languages: ['Kinyarwanda', 'English'],
    ratePerHour: 3800,
    verified: true,
    instantAvailable: true,
  },
  {
    id: 'cg-004',
    name: 'Eric Habimana',
    category: 'hospital-caretaker',
    district: 'Kigali',
    languages: ['Kinyarwanda'],
    ratePerHour: 4500,
    verified: true,
    instantAvailable: true,
  },
  {
    id: 'cg-005',
    name: 'Mireille Kayitesi',
    category: 'instant-care',
    district: 'Rubavu',
    languages: ['Kinyarwanda', 'English'],
    ratePerHour: 5000,
    verified: true,
    instantAvailable: true,
  },
]

const users: User[] = [
  {
    id: 'usr-001',
    fullName: 'Platform Admin',
    email: 'admin@mycarerwanda.com',
    phoneNumber: '0788000000',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
]

const isCareCategory = (value: string): value is CareCategory =>
  careCategories.some((item) => item.value === value)

app.use(express.json())

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.options('/{*any}', (_req, res) => {
  res.status(204).send()
})

app.get('/', (_req, res) => {
  res.json({ message: 'MyCareRwanda backend is running' })
})

app.get('/api/care-categories', (_req, res) => {
  res.json({
    categories: careCategories,
  })
})

app.get('/api/caregivers', (req, res) => {
  const category = String(req.query.category || '').trim().toLowerCase()
  const district = String(req.query.district || '').trim().toLowerCase()
  const instantOnly = String(req.query.instantOnly || '').trim().toLowerCase() === 'true'

  let results = [...caregivers]

  if (category && isCareCategory(category)) {
    results = results.filter((caregiver) => caregiver.category === category)
  }

  if (district) {
    results = results.filter((caregiver) => caregiver.district.toLowerCase() === district)
  }

  if (instantOnly) {
    results = results.filter((caregiver) => caregiver.instantAvailable)
  }

  res.json({
    total: results.length,
    caregivers: results,
  })
})

app.post('/api/auth/register', (req, res) => {
  const fullName = String(req.body?.fullName || '').trim()
  const phoneNumber = String(req.body?.phoneNumber || '').trim()
  const password = String(req.body?.password || '').trim()
  const confirmPassword = String(req.body?.confirmPassword || '').trim()
  const role = String(req.body?.role || '').trim().toLowerCase() as
    | 'client'
    | 'hospital-caretaker'
    | 'children-caretaker'

  if (!fullName || !phoneNumber || !password || !confirmPassword || !role) {
    return res.status(400).json({
      message: 'fullName, phoneNumber, password, confirmPassword, and role are required fields.',
    })
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters.',
    })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      message: 'Password and re-typed password do not match.',
    })
  }

  const allowedRoles = new Set(['client', 'hospital-caretaker', 'children-caretaker'])
  if (!allowedRoles.has(role)) {
    return res.status(400).json({
      message: 'Invalid role selected.',
    })
  }

  const phoneExists = users.some((user) => user.phoneNumber === phoneNumber)
  if (phoneExists) {
    return res.status(409).json({
      message: 'An account with this phone number already exists.',
    })
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    fullName,
    phoneNumber,
    password,
    role,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)

  return res.status(201).json({
    message: 'Registration successful.',
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      phoneNumber: newUser.phoneNumber,
      role: newUser.role,
    },
  })
})

app.post('/api/auth/login', (req, res) => {
  const phoneNumber = String(req.body?.phoneNumber || '').trim()
  const password = String(req.body?.password || '').trim()

  if (!phoneNumber || !password) {
    return res.status(400).json({
      message: 'phoneNumber and password are required fields.',
    })
  }

  const user = users.find((item) => item.phoneNumber === phoneNumber)
  if (!user || user.password !== password) {
    return res.status(401).json({
      message: 'Invalid phone number or password.',
    })
  }

  return res.json({
    message: 'Login successful.',
    user: {
      id: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
  })
})

app.post('/api/auth/google', (_req, res) => {
  return res.json({
    message: 'Google login is ready on UI. OAuth integration endpoint is pending setup.',
  })
})

app.post('/api/requests/instant-care', (req, res) => {
  const district = String(req.body?.district || '').trim()
  const need = String(req.body?.need || '').trim()

  if (!district || !need) {
    return res.status(400).json({
      message: 'district and need are required fields.',
    })
  }

  const matchingCaregivers = caregivers.filter(
    (caregiver) => caregiver.instantAvailable && caregiver.district.toLowerCase() === district.toLowerCase(),
  )

  const etaMinutes = matchingCaregivers.length > 0 ? 16 : 35

  return res.status(201).json({
    message: 'Instant care request received.',
    request: {
      id: `req-${Date.now()}`,
      district,
      need,
      estimatedMatchMinutes: etaMinutes,
      matchedCandidates: matchingCaregivers.length,
      status: 'searching',
    },
  })
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
