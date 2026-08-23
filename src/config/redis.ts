import { Redis } from "ioredis"

const redisUrl = process.env.REDIS_URL

if(!redisUrl) {
    throw new Error
}

const redis = new Redis(redisUrl)

const closeRedis = async() => {
    await redis.quit()
}

export { redis, closeRedis }

