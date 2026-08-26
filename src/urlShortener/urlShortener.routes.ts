import { Router } from 'express'
import { protectedUrlShortenerHandler } from './urlShortener.handler.js'
import { validateData } from '../middlewares/validation.middleware.js'
import { urlShortenerSchema } from './urlShortener.schema.js'

const router = Router()

router.post('/protected/urlShortener', validateData(urlShortenerSchema), protectedUrlShortenerHandler)

export default router