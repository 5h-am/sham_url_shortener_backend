import { Router } from "express"
import authRouter from './auth/auth.routes.js'
import urlShortenerRouter from './urlShortener/urlShortener.routes.js'
import adminRouter from './admin/queue.dashboard.routes.js'
import analysisRouter from './analysis/analysis.routes.js'
import { authValidation } from "./middlewares/auth.middleware.js"
import { logOutHandler } from "./auth/auth.handlers.js"
import { unprotectedUrlShortenerHandler } from "./urlShortener/urlShortener.handler.js"
import { urlShortenerSchema } from "./urlShortener/urlShortener.schema.js"
import { validateData } from "./middlewares/validation.middleware.js"
import { authLimiter, urlShortenerLimiter } from "./config/rateLimiter.js"

const router = Router()

router.post('/unprotected/urlShortener', urlShortenerLimiter, validateData(urlShortenerSchema), unprotectedUrlShortenerHandler)

router.use('/auth', authLimiter, authRouter)

router.use(authValidation)

router.use('/admin', adminRouter)

router.get('/auth/logout', logOutHandler)

router.use(urlShortenerRouter)

router.use('/analysis', analysisRouter)

router.get('/', (req, res) => {
    return res.status(200).json({
        message: "hello brother"
    })
})

export default router