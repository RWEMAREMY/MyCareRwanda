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
