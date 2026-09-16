import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger.js'
import { topValuesService, clicksOverTimeService } from './analysis.services.js'
import { clickOverTimeSchema } from './analysis.schema.js'
import { z } from 'zod'

export const topValuesHandler = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { urlsId } = req.params
        const topValues = await topValuesService(urlsId as string)

        res.status(200).json({
            message: "Top Values Fetched Successfully",
            ...topValues
        })
        
    }catch(err) {
        logger.error({ err, requestId: res.getHeader('x-request-id')}, "Error occured in top values handler")
        next(err)       
    }
}

export const clicksOverTimeHandler = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { query } = req
        const { urlsId, groupBy } = query as z.infer<typeof clickOverTimeSchema>
        const clicksOverTime = await clicksOverTimeService(urlsId, groupBy)
        res.status(200).json({
            message: "Clicks fetched successfully",
            clicksOverTime
        })

    }catch(err) {
        logger.error({ err, requestId: res.getHeader('x-request-id')}, "Error occured while fetching clicks over time" )
        next(err)
    }
}