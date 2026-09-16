import { Redis } from "ioredis"
import { env } from "./env.js"

const redisUrl = env.REDIS_URL

const redis = new Redis(redisUrl, {
    tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
})

const closeRedis = async() => {
    await redis.quit()
}

export { redis, closeRedis }

