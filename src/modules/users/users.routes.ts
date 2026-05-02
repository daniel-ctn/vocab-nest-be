import { Router } from 'express'
import { asyncHandler } from '../../shared/async-handler'
import * as controller from './users.controller'

export const userRoutes = Router()

userRoutes.get('/me', asyncHandler(controller.me))
