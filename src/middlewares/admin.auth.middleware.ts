import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/appError.js'
import { logger } from '../config/logger.js'

export const adminCheck = (req: Request, res: Response, next: NextFunction) => {
    try{
        const { role } = req
        if(!role) {
            throw new AppError('Invalid Credentials', 401)
        }
        if(role !== 'admin') {
            throw new AppError("Invalid Credentials", 401)
        }
        return next()

    }catch(err) {
        logger.error({ err }, "Error Occured in Admin Check")
        return next(err)
    }
}
