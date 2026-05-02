import type { Request, Response } from 'express'
import { requireUserId } from '../../middleware/auth'
import { sendSuccess } from '../../shared/api-response'
import { getDashboardSummary } from './dashboard.service'

export const summary = async (req: Request, res: Response) => {
  return sendSuccess(res, await getDashboardSummary(requireUserId(req)))
}
