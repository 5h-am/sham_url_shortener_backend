import { adminCheck } from "../middlewares/admin.auth.middleware.js"
import { serverAdapter } from "./queue.dashboard.js"
import { Router } from 'express'

const router = Router()

router.use('/queues', adminCheck, serverAdapter.getRouter())

export default router

