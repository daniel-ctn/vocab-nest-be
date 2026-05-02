import type { Request, Response } from 'express'
import { sendSuccess } from '../../shared/api-response'
import { requireUserId } from '../../middleware/auth'
import { parseBody, parseParams, parseQuery } from '../../shared/validation'
import {
  assignVocabularyGroupsRequestSchema,
  difficultyRequestSchema,
  favoriteRequestSchema,
  idParamsSchema,
  vocabularyCreateRequestSchema,
  vocabularyListQuerySchema,
  vocabularySearchRequestSchema,
  vocabularyUpdateRequestSchema,
} from './vocabulary.schemas'
import {
  createVocabulary,
  deleteVocabulary,
  getVocabulary,
  listVocabulary,
  replaceVocabularyGroups,
  searchVocabulary,
  updateDifficulty,
  updateFavorite,
  updateVocabulary,
} from './vocabulary.service'

export const search = async (req: Request, res: Response) => {
  const userId = requireUserId(req)
  const body = parseBody(req, vocabularySearchRequestSchema)
  const result = await searchVocabulary(userId, body.query)
  return sendSuccess(res, result)
}

export const create = async (req: Request, res: Response) => {
  const userId = requireUserId(req)
  const body = parseBody(req, vocabularyCreateRequestSchema)
  const result = await createVocabulary(userId, body)
  return sendSuccess(res, result, { status: 201 })
}

export const list = async (req: Request, res: Response) => {
  const userId = requireUserId(req)
  const query = parseQuery(req, vocabularyListQuerySchema)
  const result = await listVocabulary(userId, query)
  return sendSuccess(res, result.items, { meta: result.meta })
}

export const getById = async (req: Request, res: Response) => {
  const userId = requireUserId(req)
  const { id } = parseParams(req, idParamsSchema)
  return sendSuccess(res, await getVocabulary(userId, id))
}

export const patch = async (req: Request, res: Response) => {
  const userId = requireUserId(req)
  const { id } = parseParams(req, idParamsSchema)
  const body = parseBody(req, vocabularyUpdateRequestSchema)
  return sendSuccess(res, await updateVocabulary(userId, id, body))
}

export const remove = async (req: Request, res: Response) => {
  const userId = requireUserId(req)
  const { id } = parseParams(req, idParamsSchema)
  return sendSuccess(res, await deleteVocabulary(userId, id))
}

export const replaceGroups = async (req: Request, res: Response) => {
  const userId = requireUserId(req)
  const { id } = parseParams(req, idParamsSchema)
  const body = parseBody(req, assignVocabularyGroupsRequestSchema)
  return sendSuccess(res, await replaceVocabularyGroups(userId, id, body.groupIds))
}

export const patchFavorite = async (req: Request, res: Response) => {
  const userId = requireUserId(req)
  const { id } = parseParams(req, idParamsSchema)
  const body = parseBody(req, favoriteRequestSchema)
  return sendSuccess(res, await updateFavorite(userId, id, body.favorite))
}

export const patchDifficulty = async (req: Request, res: Response) => {
  const userId = requireUserId(req)
  const { id } = parseParams(req, idParamsSchema)
  const body = parseBody(req, difficultyRequestSchema)
  return sendSuccess(res, await updateDifficulty(userId, id, body.difficulty))
}
