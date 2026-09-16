import { env } from './env.js'
import { Queue } from 'bullmq'
import { Redis } from 'ioredis'

export const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    tls: env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
})

export const queueQuit = async() => {
    await connection.quit()
}


export const urlShortenerQueue = new Queue('urlShortener', { connection })
export const urlAnalysisQueue = new Queue('urlAnalysis', { connection })
export const expiredUrlsQueue = new Queue('expiredUrls', { connection })