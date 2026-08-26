import { env } from './env.js'
import { Queue } from 'bullmq'
import { Redis } from 'ioredis'

export const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
})


export const urlShortenerQueue = new Queue('urlShortener', { connection })
export const urlAnalysisQueue = new Queue('urlAnalysis', { connection })