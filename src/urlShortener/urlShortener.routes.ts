import { Router } from 'express'
import { listAllUrls, protectedUrlShortenerHandler, urlDeleteHandler } from './urlShortener.handler.js'
import { validateData } from '../middlewares/validation.middleware.js'
import { urlShortenerSchema } from './urlShortener.schema.js'

const router = Router()

router.post('/protected/urlShortener', validateData(urlShortenerSchema), protectedUrlShortenerHandler)

router.get('/fetchUrls', listAllUrls)

router.get('/urlDelete/:urlCode', urlDeleteHandler)


export default router