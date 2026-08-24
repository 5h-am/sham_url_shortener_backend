import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger.js'
import { AppError } from '../utils/appError.js'
import { env } from '../config/env.js'
import { redis } from '../config/redis.js'

export const authValidation = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { Authorization } = req.headers
        if(!Authorization || Authorization === undefined) {
            throw new AppError("Invalid Credentials", 401)
        }
        if(typeof Authorization === 'string') {
            if(!(Authorization.startsWith('Bearer'))){
                throw new AppError("Invalid Credentials", 401)
            }
            const refreshToken = Authorization.slice(0, 7)
            const payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET)
            if(typeof payload !== 'string') {
                const redisInfo = await redis.hgetall(`refresh:${payload.requestId}`)
                if(!(Object.keys(redisInfo).length > 0)) {
                    throw new AppError('Invalid Credentials', 401)
                }
                req.userId = redisInfo.userId
                next()
            }

        }else {
            throw new AppError("Invalid Credentials", 401)
        }
        
    }catch(err) {
        logger.error({err, requestId: res.getHeader('x-request-id')}, "Error Occured in in auth middleware")
        if(err instanceof jwt.TokenExpiredError) {
            next(new AppError("Invalid Credentials", 401))
        }

        if(err instanceof jwt.JsonWebTokenError) {
            next(new AppError("Invalid Credentials", 401))
        }
        next(err)
    }
}