import { Redis } from "ioredis"
import { env } from "./env.js"

const redisUrl = env.REDIS_URL

if(!redisUrl) {
    throw new Error
}

const redis = new Redis(redisUrl)

const closeRedis = async() => {
    await redis.quit()
}

export { redis, closeRedis }

