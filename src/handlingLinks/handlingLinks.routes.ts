import { Router } from 'express'
import { redirectHandler } from './handlingLinks.handler.js'
import { redirectUrlLimiter } from '../config/rateLimiter.js'

const router = Router()

router.get('/:urlCode', redirectUrlLimiter, redirectHandler)

export default router


