import { Router } from 'express'
import { topValuesHandler, clicksOverTimeHandler } from './analysis.handlers.js'
import { clickOverTimeSchema } from './analysis.schema.js'
import { queryValidator } from '../middlewares/validation.middleware.js'

const router = Router()

router.get('/topValues/:urlsId', topValuesHandler)

router.get('/clicksOverTime', queryValidator(clickOverTimeSchema), clicksOverTimeHandler)

export default router