import { Router } from 'express'
import { topValuesHandler, clicksOverTimeHandler } from './analysis.handlers.js'
import { clickOverTimeSchema } from './analysis.schema.js'
import { clicksOverTimeValidator } from './analysis.middleware.js'

const router = Router()

router.get('/topValues', topValuesHandler)

router.get('/clicksOverTime', clicksOverTimeValidator(clickOverTimeSchema), clicksOverTimeHandler)

export default router