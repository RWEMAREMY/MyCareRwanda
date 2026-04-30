import { Request, Response } from 'express'
import { caregivers } from '../data/careData'

export const instantCareRequestController = (req: Request, res: Response) => {
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
}
