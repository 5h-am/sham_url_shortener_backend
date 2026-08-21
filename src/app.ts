import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import userRoutes from './routes.js'
import { globalErrorHandler } from './config/globalErrorHandler.js'
import { AppError } from './utils/appError.js'

dotenv.config()

const app = express()

app.use(helmet())
app.use(morgan('combined'))
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(cookieParser(process.env.COOKIES_SIGN))

app.use(express.json({ limit: '10KB'}))
app.use(express.urlencoded({extended: true}))

app.use('/api/v1', userRoutes)

app.use((req, res, next) => {
    const err = new AppError(`Can't find requested url ${req.originalUrl} on this server`, 404)
    next(err)    
})

app.use(globalErrorHandler)

export default app;