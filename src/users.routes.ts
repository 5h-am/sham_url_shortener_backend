import { Router } from "express"
import authRouter from './auth/auth.routes.js'
import { authValidation } from "./middlewares/auth.middleware.js"
import { logOutHandler } from "./auth/auth.handlers.js"

const router = Router()

router.use('/auth', authRouter)

router.use(authValidation)

router.get('/auth/logout', logOutHandler)

router.get('/', (req, res) => {
    return res.status(200).json({
        message: "hello"
    })
})

export default router