import { NextFunction, Request, Response } from "express"
import { AppError } from "../utils/appError.js"
import { logger } from './logger.js'

export const globalErrorHandler = (err:unknown, req: Request, res: Response, next: NextFunction) => {
    const mode = process.env.NODE_ENV
    logger.error({ err, requestId: res.getHeader("x-request-id") })
    if(mode === 'production' || mode === 'testing') {
        if(err instanceof AppError) {
            return res.status(err.statusCode).json({
                message: err.message,
                status: err.status
            })
        }
        return res.status(500).json({
            message: "Internal Server Error",
            status: "error"
        })
    }
    
    if(mode === 'development') {
        if(err instanceof AppError) {
            return res.status(err.statusCode).json({
                message: err.message,
                statusCode: err.statusCode,
                status: err.status,
                stack: err.stack
            })
        }

        return res.status(500).json({
            message: err instanceof Error ? err.message : "Unknown",
            statusCode : 500,
            status: "error",
            stack: err instanceof Error ? err.stack : undefined
        })
    }
    return true;

}