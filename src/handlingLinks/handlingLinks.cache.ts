import { redis } from '../config/redis.js'
import { logger } from '../config/logger.js'
import { fetchOriginalUrl } from './handlingLinks.repositories.js'


export const urlsCache = async(urlCode: string) => {
    try{
        const redisInfo = await redis.hgetall(`originalUrl:${urlCode}`)
        const randomTtl = Math.floor(4 + (Math.random() * 4))
        if((Object.keys(redisInfo).length) > 0) {
            await redis.expire(`originalUrl:${urlCode}`, 60 * randomTtl)
            return {
                ...redisInfo
            }
        }

        const dbData = await fetchOriginalUrl(urlCode)
        await redis.hset(`originalUrl:${urlCode}`, {
            ...dbData
        })
        await redis.expire(`originalUrl:${urlCode}`, 60 * randomTtl)
        return {
            ...dbData
        }  
    
    }catch(err) {
        logger.error({ err }, "Error occured in urlsCache")
        throw err
    }
}