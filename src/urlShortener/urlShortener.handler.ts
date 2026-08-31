import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger.js'
import { redis } from '../config/redis.js'
import { base62encoding } from '../utils/base62encoding.js'
import { env } from '../config/env.js'
import { urlShortenerQueue, expiredUrlsQueue } from '../config/queue.js'
import { AppError } from '../utils/appError.js'
import { deleteUrl, fetchUrls } from './urlShortener.repositories.js'


export const protectedUrlShortenerHandler = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { originalUrl } = req.body
        const { userId } = req
        const { query } = req
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

            if(query?.expiresAt ) {

                if(typeof query.expiresAt !== 'string') {
                    throw new AppError("Invalid expiresAt parameter", 400)
                }
                const expireDate = new Date(query.expiresAt)

                if (isNaN(expireDate.getTime())) {
                    throw new AppError("Invalid date format for expiresAt", 400);
                }
                const expireTime = expireDate.getTime() - Date.now()
                if(expireTime <= 0) {
                    throw new AppError("Expiration Time must be in the future", 400)
                }
                await expiredUrlsQueue.add('delete-url-on-expire-date', { userId, urlCode }, {
                priority: 2,
                attempts: 4,
                delay: expireTime,
                backoff: {
                    type: 'exponential',
                    delay: 2000
                },
                removeOnComplete: { age: 24 * 60 * 60},
                removeOnFail: { age: 7 * 24 * 60 * 60},
            })
        }
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

export const urlDeleteHandler = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { query } = req
        const { userId } = req
        if(!query?.urlCode || typeof query.urlCode !== 'string') {
            throw new AppError("Invalid urlCode parameter", 400)
        }
        await deleteUrl(query.urlCode, userId as string)
        res.status(200).json({
            message: "Url Deleted Successfully"
        })


    }catch(err){
        logger.error({ err, requestId: res.getHeader('x-request-id') }, "Error occured while deleting the url")
        next(err)
    }
}


export const listAllUrls = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { userId } = req
        const urls = await fetchUrls(userId as string)
        res.status(200).json({
            message: "Urls Fetched Successfully",
            urls,
        })

    }catch(err) {
        logger.error({ err, requestId: res.getHeader('x-request-id') }, "Error occured while fetching all the urls")
        next(err)
    }
}