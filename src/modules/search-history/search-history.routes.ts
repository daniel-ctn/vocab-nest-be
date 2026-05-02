import { Router } from 'express'
import { asyncHandler } from '../../shared/async-handler'
import * as controller from './search-history.controller'

export const searchHistoryRoutes = Router()

searchHistoryRoutes.get('/', asyncHandler(controller.list))
searchHistoryRoutes.get('/:id', asyncHandler(controller.getById))
