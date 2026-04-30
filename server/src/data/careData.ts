export type CareCategory =
  | 'child-care'
  | 'adult-care'
  | 'home-care'
  | 'hospital-caretaker'
  | 'instant-care'

export interface Caregiver {
  id: string
  name: string
  category: CareCategory
  district: string
  languages: string[]
  ratePerHour: number
  verified: boolean
  instantAvailable: boolean
}

export const careCategories: Array<{ value: CareCategory; label: string; description: string }> = [
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

export const caregivers: Caregiver[] = [
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
