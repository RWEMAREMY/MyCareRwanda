import { Request, Response } from 'express'
import { careCategories, caregivers, CareCategory } from '../data/careData'

const isCareCategory = (value: string): value is CareCategory =>
  careCategories.some((item) => item.value === value)

export const listCareCategoriesController = (_req: Request, res: Response) => {
  res.json({ categories: careCategories })
}

export const listCaregiversController = (req: Request, res: Response) => {
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
}
