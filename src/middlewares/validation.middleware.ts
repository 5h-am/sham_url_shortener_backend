import { Request, Response, NextFunction } from "express"
import { z, ZodError } from 'zod'
import { logger } from '../config/logger.js'
import { AppError } from "../utils/appError.js"

export function validateData(schema: z.ZodObject){
    return (req: Request, res: Response, next: NextFunction) => {
        try{
            schema.parse(req.body)
            next()
        }catch(err) {
            if(err instanceof ZodError) {
            logger.error({ err, requestId: res.getHeader("x-request-id")})
                next(new AppError("Bad Request", 400))
            }else {
                next(new AppError("Internal Server Error", 500))
            }
        }
    }
}