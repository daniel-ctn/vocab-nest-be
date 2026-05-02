import type { Request, Response } from 'express'
import { idParamsSchema, searchHistoryListQuerySchema } from '../../contracts'
import { requireUserId } from '../../middleware/auth'
import { sendSuccess } from '../../shared/api-response'
import { parseParams, parseQuery } from '../../shared/validation'
import * as service from './search-history.service'

export const list = async (req: Request, res: Response) => {
  const userId = requireUserId(req)
  const query = parseQuery(req, searchHistoryListQuerySchema)
  const result = await service.listSearchHistory(userId, query.page, query.pageSize)
  return sendSuccess(res, result.items, { meta: result.meta })
}

export const getById = async (req: Request, res: Response) => {
  const userId = requireUserId(req)
  const { id } = parseParams(req, idParamsSchema)
  return sendSuccess(res, await service.getSearchHistory(userId, id))
}
