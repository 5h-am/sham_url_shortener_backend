import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger.js'
import { redis } from '../config/redis.js'
import { base62encoding } from '../utils/base62encoding.js'
import { env } from '../config/env.js'
import { urlShortenerQueue } from '../config/queue.js'


export const protectedUrlShortenerHandler = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { originalUrl } = req.body
        const { userId } = req
        const urlNumber = await redis.incr('urlCount')
        const urlCode = base62encoding(urlNumber)

        await urlShortenerQueue.add('insert-url-database-protected', { originalUrl, urlCode, userId }, {
            priority: 5,
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 2000
            },
            removeOnComplete: { age: 24 * 60 * 60},
            removeOnFail: { age: 7 * 24 * 60 * 60}
        })
        res.status(200).json({
            message: "Url Shortened Successfully",
            url: `${env.BACKEND_URL}/${urlCode}`
        })
        
    }catch(err) {
        logger.error({ err, requestId: res.getHeader('x-request-id') }, 'Error Occured in protected url shortener handler')
        next(err)
    }
}

export const unprotectedUrlShortenerHandler = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { originalUrl } = req.body
        const urlNumber = await redis.incr('urlCount')
        const urlCode = base62encoding(urlNumber)

        await urlShortenerQueue.add('insert-url-database-unprotected', { originalUrl, urlCode }, {
            priority: 4,
        })
        res.status(200).json({
            message: "Url Shortened Successfully",
            url: `${env.BACKEND_URL}/${urlCode}`
        })
        
    }catch(err) {
        logger.error({ err, requestId: res.getHeader('x-request-id') }, 'Error Occured in protected url shortener handler')
        next(err)
    }
}