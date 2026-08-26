import { Request, Response, NextFunction } from 'express'
import { logger } from '../config/logger.js'
import { signUpService, logInService, refreshService, forgetPwdService, resetPwdService } from './auth.services.js'
import { env } from '../config/env.js'
import { redis } from '../config/redis.js'
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/appError.js'

export const signUpHandler = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { email, password, fullName } = req.body
        const { accessToken, refreshId, refreshToken, userId, role } = await signUpService(email, password, fullName)

        await redis.hset(`refresh:${refreshId}`, {
            userId,
            role,
            createdAt: Date.now()
        })
        await redis.expire(`refresh:${refreshId}`, 60 * 60 * 24 * 7)

        res.cookie('refreshToken', refreshToken, {
            signed: true,
            httpOnly: true,
            secure: env.NODE_ENV === "production" ? true : false,
            path: '/api/v1/auth/'
        })

        res.status(201).json({
            message: "Account Created Successfully",
            accessToken
        })
    }catch(err) {
        logger.error({ err, requestId: res.getHeader('x-request-id')}, "Error Occured while in sign up handler")
        next(err)
    }
} 


export const logInHandler = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { email, password } = req.body
        const { accessToken, refreshId, refreshToken, userId, role } = await logInService(email, password)
        await redis.hset(`refresh:${refreshId}`, {
            userId,
            role,
            createdAt: Date.now()
        })
        await redis.expire(`refresh:${refreshId}`, 60 * 60 * 24 * 7)

        res.cookie('refreshToken', refreshToken, {
            signed: true,
            httpOnly: true,
            secure: env.NODE_ENV === "production" ? true : false,
            path: '/api/v1/auth/'
        })

        res.status(200).json({
            message: "Login Successful",
            accessToken
        })
    }catch(err) {
        logger.error({ err, requestId: res.getHeader('x-request-id')}, "Error Occured in Login Handler")
        next(err)
    }
}

export const refreshHandler = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.signedCookies
        if(!refreshToken) {
            throw new AppError('Invalid Credentials', 401)
        }
        const payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET)
        if(typeof payload !== 'string') {
            const redisInfo = await redis.hgetall(`refresh:${payload.refreshId}`)
            if(!(Object.keys(redisInfo).length > 0)) {
                throw new AppError('Invalid Credentials', 401)
            }
            const { accessToken, refreshId, refreshToken } = refreshService(redisInfo.userId)
            await redis.hset(`refresh:${refreshId}`, {
                userId: redisInfo.userId,
                createdAt: Date.now()
            })

            res.cookie('refreshToken', refreshToken, {
                signed: true,
                httpOnly: true,
                secure: env.NODE_ENV === "production" ? true : false,
                path: '/api/v1/auth/'
            })

            return res.status(200).json({
                message: "Token Refreshed Successfully",
                accessToken
            })
        }
        return null
        
    } catch(err) {
        logger.error({ err, requestId: res.getHeader('x-request-id')}, "Error occured while handling refresh endpoint")
        if(err instanceof jwt.TokenExpiredError) {
            return next(new AppError("Invalid Credentials", 401))
        }

        if(err instanceof jwt.JsonWebTokenError) {
            return next(new AppError("Invalid Credentials", 401))
        }
        return next(err)
    }
}

export const logOutHandler = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { refreshToken } = req.signedCookies
        if(!refreshToken) {
            throw new AppError('Already Logged Out', 400)
        }
        const payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET)
        if(typeof payload !== 'string') {
            const redisInfo = await redis.hgetall(`refresh:${payload.refreshId}`)
            if(!(Object.keys(redisInfo).length > 0)) {
                throw new AppError('Already Logged Out', 400)
            }
            await redis.del(`refresh:${payload.refreshId}`)
            res.clearCookie('refreshToken')

            return res.status(200).json({
                message: "Logged Out Successfully"
            })
        }
        return null

    }catch(err) {
        logger.error({ err, requestId: res.getHeader('x-request-id')}, 'Error Occured in log out handler')
        if(err instanceof jwt.TokenExpiredError) {
            return next(new AppError("Invalid Credentials", 401))
        }

        if(err instanceof jwt.JsonWebTokenError) {
            return next(new AppError("Invalid Credentials", 401))
        }
        return next(err)
    }
}

export const forgetPwdHandler = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { email } = req.body
        await forgetPwdService(email)
        res.status(200).json({
            message: "Password details send to your email"
        })

    }catch(err) {
        logger.error({ err, requestId: res.getHeader('x-request-id')}, "Error Occured in forget pwd handler")
        next(err)
    }
}

export const resetPwdHandler = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const { token, newPassword } = req.body
        await resetPwdService(token, newPassword)

        const { refreshToken } = req.signedCookies
        if(!refreshToken) {
            return res.status(200).json({
                message: "Password Reset Successfully"
            })
        }

        const payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET)
        if(typeof payload !== 'string') {
            const redisInfo = await redis.hgetall(`refresh:${payload.refreshId}`)
            if(!(Object.keys(redisInfo).length > 0)) {
                return res.status(200).json({
                    message: "Password Reset Successfully"
                })
            }
            await redis.del(`refresh:${payload.refreshId}`)
            res.clearCookie('refreshToken')
            return res.status(200).json({
                message: "Password Reset Successfully"
            })
        }
        return res.status(200).json({
            message: "Password Reset Successfully"
        })
        
    }catch(err) {
        logger.error({ err, requestId: res.getHeader('x-request-id')}, "Error Occured in reset pwd handler")
        if(err instanceof jwt.TokenExpiredError) {
            return res.status(400).json({
                message: 'Reset link has been expired'
            })
        }

        if(err instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({
                message: "Invalid reset link"
            })
        }
        return next(err)
    }
}


