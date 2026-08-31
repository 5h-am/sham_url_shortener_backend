import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AppError } from '../../../src/utils/appError.js'
import { Request, Response } from 'express'

vi.mock('../../../src/config/logger.js', () => {
    return {
        logger: {
            error: vi.fn()
        }
    }
})

vi.mock('../../../src/config/redis.js', () => {
    return {
        redis: {
            hgetall: vi.fn(),
            incr: vi.fn()
        }
    }
})

vi.mock('jsonwebtoken', () => {
    class TokenExpiredError extends Error{
        constructor(message = 'jwt expired'){
            super()
            this.name = 'Token Expired Error'
        }
    }

    class JsonWebTokenError extends Error {
        constructor(message = 'invalid token'){
            super()
            this.name = 'Json Web Token Error'
        }
    }
    return {
        default: {
            verify: vi.fn(),
            TokenExpiredError,
            JsonWebTokenError
        }
    }
})

const verifyMock = jwt.verify as unknown as ReturnType<typeof vi.fn>
const hgetAll = redis.hgetall as unknown as ReturnType<typeof vi.fn>

import { logger } from '../../../src/config/logger.js'
import { redis } from '../../../src/config/redis.js'
import jwt from 'jsonwebtoken'
import { authValidation } from '../../../src/middlewares/auth.middleware.js'

describe('Auth middleware test', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const res = { getHeader: vi.fn()} as unknown as Response

    it("should call next with nothing to pass for proper signUp", async() => {
        verifyMock.mockReturnValue({
            requestId: '12345'
        })

        hgetAll.mockResolvedValue({
            userId: 'qwerty',
            role: 'user'
        })

        const req = { headers: { Authorization: 'Bearer abc123'}} as unknown as Request
        const next = vi.fn()
        await authValidation(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith()
    })

    it("should call next with error if authorisation is missing", async() => {
        const err = new AppError('Invalid Credentials', 401 )
        const req = {headers: {}} as unknown as Request
        const next = vi.fn()
        await authValidation(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
        expect(hgetAll).not.toHaveBeenCalled()
        expect(verifyMock).not.toHaveBeenCalled()
        expect(logger.error).toHaveBeenCalled()
    })

    it('should call next with error if authorisation is not a string', async() => {
        const err = new AppError('Invalid Credentials', 401 )
        const req = {headers: { Authorization: 12345}} as unknown as Request
        const next = vi.fn()
        await authValidation(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
        expect(hgetAll).not.toHaveBeenCalled()
        expect(verifyMock).not.toHaveBeenCalled()
    })

    it('should call next with error if authorisation is not a bearer token', async() => {
        const err = new AppError('Invalid Credentials', 401 )
        const req = {headers: { Authorization: 'abc123'}} as unknown as Request
        const next = vi.fn()
        await authValidation(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
        expect(hgetAll).not.toHaveBeenCalled()
        expect(verifyMock).not.toHaveBeenCalled()
    })

    it('should call next with error if token is expired', async() => {
        const err = new jwt.TokenExpiredError('token expired', new Date())
        const defaultErr = new AppError('Invalid Credentials', 401)
        verifyMock.mockImplementation(() => {
            throw err
        })
        const req = { headers: { Authorization: 'Bearer abc123'}} as unknown as Request
        const next = vi.fn()

        await authValidation(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(defaultErr)
        expect(hgetAll).not.toHaveBeenCalled()
    })

    it('should call next with error if token is invalid', async() => {
        const err = new jwt.JsonWebTokenError('invalid token')
        const defaultErr = new AppError('Invalid Credentials', 401)
        verifyMock.mockImplementation(() => {
            throw err
        })
        const req = { headers: { Authorization: 'Bearer abc123'}} as unknown as Request
        const next = vi.fn()

        await authValidation(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(defaultErr)
        expect(hgetAll).not.toHaveBeenCalled()
    })

    it('should call with error if redis returns an empty object', async() => {

        verifyMock.mockReturnValue({
            requestId: '12345'
        })
        const err = new AppError('Invalid Credentials', 401)

        hgetAll.mockResolvedValue({})
        const req = { headers: { Authorization: 'Bearer abc123'}} as unknown as Request
        const next = vi.fn()
        await authValidation(req, res, next)

        expect(next).toHaveBeenCalledExactlyOnceWith(err)

    })

})