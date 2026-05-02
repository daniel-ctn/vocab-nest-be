import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { asyncHandler } from '../../shared/async-handler'
import * as controller from './vocabulary.controller'

export const vocabularyRoutes = Router()

const searchLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
})

vocabularyRoutes.post('/search', searchLimiter, asyncHandler(controller.search))
vocabularyRoutes.post('/', asyncHandler(controller.create))
vocabularyRoutes.get('/', asyncHandler(controller.list))
vocabularyRoutes.get('/:id', asyncHandler(controller.getById))
vocabularyRoutes.patch('/:id', asyncHandler(controller.patch))
vocabularyRoutes.delete('/:id', asyncHandler(controller.remove))
vocabularyRoutes.post('/:id/groups', asyncHandler(controller.replaceGroups))
vocabularyRoutes.patch('/:id/favorite', asyncHandler(controller.patchFavorite))
vocabularyRoutes.patch('/:id/difficulty', asyncHandler(controller.patchDifficulty))
