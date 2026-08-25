import { z } from 'zod'
import { logger } from './logger.js'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
    PORT: z.coerce.number().min(1000),
    NODE_ENV: z.union([z.literal('development'), z.literal('testing'), z.literal('production')]),
    COOKIES_SIGN: z.string().min(1),
    ACCESS_TOKEN_SECRET: z.string().min(1),
    REFRESH_TOKEN_SECRET: z.string().min(1),
    RESET_PASSWORD_TOKEN_SECRET: z.string().min(1),
    FRONTEND_URL: z.url().startsWith('http'),
    BACKEND_URL: z.url().startsWith('http'),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DB: z.string(),

    POSTGRES_PORT: z.coerce.number().min(1000),
    REDIS_PORT: z.coerce.number().min(1000),
    DATABASE_URL: z.url().startsWith('postgres'),
    REDIS_URL: z.url().startsWith('redis'),

    SMTP_USER: z.email(),
    SMTP_PWD: z.string().min(8),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.coerce.number(),
    SMTP_SERVICE: z.string()
})

const result = envSchema.safeParse(process.env)
if(!result.success) {
    logger.error({ err: result.error.flatten().fieldErrors}, "Invalid Environment Variables")
    process.exit(1)

}

export type EnvConfig = z.infer<typeof envSchema>

export const env = result.data 
