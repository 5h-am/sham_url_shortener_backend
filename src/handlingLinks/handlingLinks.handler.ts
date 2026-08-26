import { fetchOriginalUrl } from "./handlingLinks.repositories.js"
import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger.js'
import { AppError } from "../utils/appError.js"
import { urlAnalysisQueue } from "../config/queue.js"

export const redirectHandler = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { urlCode } = req.params
        const userAgent = req.headers['user-agent']
        const referrer = req.headers.referer
        const ipAddress = req.ip
        const clickedAt = new Date()
        if(typeof urlCode !== 'string') {
            throw new AppError('Invalid short url', 400)
        }
        const originalUrlDetails = await fetchOriginalUrl(urlCode)
        const urlsId = originalUrlDetails.id

        await urlAnalysisQueue.add('url-click-analysis', { userAgent, referrer, ipAddress, clickedAt, urlsId }, {
            priority: 3,
            attempts: 5,
            backoff: {
                type: 'exponential',
                delay: 2000
            },
            removeOnComplete: { age: 24 * 60 * 60},
            removeOnFail: { age: 7 * 24 * 60 * 60},
        })
        res.redirect(302, originalUrlDetails.original_url)

    }catch(err) {
        logger.error({ err }, "Error Occured in redirect Handler")
        next(err)
    }
}