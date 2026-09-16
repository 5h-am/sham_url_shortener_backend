import { Router } from 'express'
import { listAllUrls, protectedUrlShortenerHandler, urlDeleteHandler } from './urlShortener.handler.js'
import { validateData, queryValidator } from '../middlewares/validation.middleware.js'
import { urlShortenerSchema, listAllUrlsSchema } from './urlShortener.schema.js'

const router = Router()

router.post('/protected/urlShortener', validateData(urlShortenerSchema), protectedUrlShortenerHandler)

router.get('/fetchUrls', queryValidator(listAllUrlsSchema), listAllUrls)

router.get('/urlDelete/:urlId', urlDeleteHandler)


export default router