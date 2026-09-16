import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import userRoutes from './users.routes.js'
import { globalErrorHandler } from './config/globalErrorHandler.js'
import { configLogger } from './config/logger.js'
import { AppError } from './utils/appError.js'
import { swaggerDocs } from './config/swagger.js'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env.js'
import redirectRouter from './handlingLinks/handlingLinks.routes.js'
import './urlShortener/urlShortener.worker.js'
import './handlingLinks/handlingLinks.worker.js'

const app = express()

configLogger(app)

app.use(helmet())
app.use(morgan('combined'))
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true
}))

app.use(cookieParser(env.COOKIES_SIGN))

app.use(express.json({ limit: '10KB'}))
app.use(express.urlencoded({extended: true}))

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

app.use(redirectRouter)

app.use('/api/v1', userRoutes)

app.use((req, res, next) => {
    const err = new AppError(`Can't find requested url ${req.originalUrl} on this server`, 404)
    next(err)    
})

app.use(globalErrorHandler)

export default app;