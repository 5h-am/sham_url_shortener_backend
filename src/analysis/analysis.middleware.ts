import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger.js'
import { AppError } from '../utils/appError.js'


export const clicksOverTimeValidator = (schema: z.ZodObject) => {
    return(req: Request, res: Response, next: NextFunction) => {
        try{
            schema.parse(req.query)
            next()
        }catch(err){
            logger.error({ err, requestId: res.getHeader("x-request-id")})
            if(err instanceof z.ZodError) {
                next(new AppError("Bad Request", 400))
            }else {
                next(new AppError("Internal Server Error", 500))
            }
        }

    }


}