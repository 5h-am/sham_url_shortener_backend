import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AppError } from '../../src/utils/appError.js'
import { Request, Response, NextFunction } from 'express'

vi.mock('../../src/config/logger.js', () => {
    return {
        logger: {
            error: vi.fn()
        }
    }
})

import { logger } from '../../src/config/logger.js'
import { globalErrorHandler } from '../../src/config/globalErrorHandler.js'
import { env } from '../../src/config/env.js'

describe('Global Error Handler Test', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it('should return 500 for unknown error in production', () => {
        const req = {} as unknown as Request
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            getHeader: vi.fn()
        } as unknown as Response
        const next = vi.fn() as unknown as NextFunction

        const err = new Error('Unknown Error')
        env.NODE_ENV = 'production'
        globalErrorHandler(err, req, res, next)
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledExactlyOnceWith({
            message: 'Internal Server Error',
            status: 'error'
        })
    })

    it('should return 500 for unknown error in development', () => {
        const req = {} as unknown as Request
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            getHeader: vi.fn()
        } as unknown as Response
        const next = vi.fn() as unknown as NextFunction
        const err = new Error('Unknown Error')
        env.NODE_ENV = 'development'
        globalErrorHandler(err, req, res, next)
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledExactlyOnceWith({
            message: 'Unknown Error',
            status: 'error',
            statusCode: 500,
            stack: err.stack
        })
    })

    it('should return status code and message for AppError in production', () => {
        const req = {} as unknown as Request
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            getHeader: vi.fn()  
        } as unknown as Response
        const next = vi.fn() as unknown as NextFunction
        const err = new AppError('Custom Error', 400)
        env.NODE_ENV = 'production'
        globalErrorHandler(err, req, res, next)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledExactlyOnceWith({
            message: 'Custom Error',
            status: 'fail'
        })
    })

    it('should return status code, message and stack for AppError in development', () => {
        const req = {} as unknown as Request
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            getHeader: vi.fn()  
        } as unknown as Response
        const next = vi.fn() as unknown as NextFunction
        const err = new AppError('Custom Error', 400)
        env.NODE_ENV = 'development'
        globalErrorHandler(err, req, res, next)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledExactlyOnceWith({
            message: 'Custom Error',
            stack: err.stack,
            status: 'fail',
            statusCode: 400
        })
    })
})