import { describe, it, vi, beforeEach, expect, afterEach } from "vitest"

vi.mock('../../../src/config/logger.js', () => {
    return {
        logger: {
            error: vi.fn(),
            info: vi.fn()
        }
    }
})

vi.mock('../../../src/auth/auth.services.js', () => {
    return {
        signUpService: vi.fn(),
        logInService: vi.fn(),
        refreshService: vi.fn(),
        forgetPwdService: vi.fn(),
        resetPwdService: vi.fn()
    }
})

vi.mock('../../../src/config/redis.js', () => {
    return {
        redis: {
            hset: vi.fn(),
            hgetall: vi.fn(),
            expire: vi.fn(),
            del: vi.fn()
        }
    }
})

vi.mock('jsonwebtoken', () => {
    class TokenExpiredError extends Error {
        constructor(message: 'token expired'){
            super()
            this.name = 'Token Expired Error'
        }
    }
    
    class JsonWebTokenError extends Error {
        constructor(message: 'invalid token'){
            super()
            this.name = "Json Web Token Error"
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

import { Request, Response, NextFunction } from 'express'
import { logger } from '../../../src/config/logger.js'
import { signUpService, logInService, refreshService, forgetPwdService, resetPwdService } from '../../../src/auth/auth.services.js'
import { signUpHandler, logInHandler, refreshHandler, logOutHandler, resetPwdHandler } from '../../../src/auth/auth.handlers.js'
import { redis } from '../../../src/config/redis.js'
import jwt from 'jsonwebtoken'
import { AppError } from '../../../src/utils/appError.js'
import { error } from "node:console"

const redisHsetMock = redis.hset as unknown as ReturnType<typeof vi.fn>
const mockVerify = jwt.verify as unknown as ReturnType<typeof vi.fn>
const mockHgetAll = redis.hgetall as unknown as ReturnType<typeof vi.fn>

afterEach(() => {
    vi.resetAllMocks()
})

describe('Sign Up Handler Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const signUpServiceMock = signUpService as unknown as ReturnType<typeof vi.fn> 
    it("should return 201 for successfull signup", async() => {
        signUpServiceMock.mockResolvedValue({
            accessToken: '123',
            refreshId: '123',
            refreshToken: '123',
            userId: '123'
        }) 

        const req = { body: {email: 'shubham@gmail.com', password: '12345678', fullName: 'shubham'}} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            cookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response 

        await signUpHandler(req, res, next)
        expect(res.status).toHaveBeenCalledExactlyOnceWith(201)
        expect(res.json).toHaveBeenCalledExactlyOnceWith({
            message: "Account Created Successfully",
            accessToken: '123'
        })
        expect(redis.hset).toHaveBeenCalled()
        expect(redis.expire).toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
    })

    it('should call next with error if sign up servide throws an error', async() => {
        const err = new Error('Hello brother')
        signUpServiceMock.mockImplementation(() => {
            throw err
        })
        const req = { body: {email: 'shubham@gmail.com', password: '12345678', fullName: 'shubham'}} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            cookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response 

        await signUpHandler(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).not.toHaveBeenCalled()
        expect(redis.hset).not.toHaveBeenCalled()
        expect(redis.expire).not.toHaveBeenCalled()
    })

    it("should call next with error if redis throws an error", async() => {
        signUpServiceMock.mockResolvedValue({
            accessToken: '123',
            refreshId: '123',
            refreshToken: '123',
            userId: '123'
        })
        redisHsetMock.mockImplementation(() => {
            throw new Error('Redis error')
        })

        const req = { body: {email: 'shubham@gmail.com', password: '12345678', fullName: 'shubham'}} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            cookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response 

        await signUpHandler(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(new Error('Redis error'))
        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).not.toHaveBeenCalled()
        expect(redis.expire).not.toHaveBeenCalled()
    })


})


describe('Log In Handler Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })
    
    const logInServiceMock = logInService as unknown as ReturnType<typeof vi.fn>
    it('should return 200 for successfull Login', async() => {
        logInServiceMock.mockResolvedValue({
            accessToken: '123',
            refreshId: '123',
            refreshToken: '123',
            userId: '123'
        })

        const req = { body: {email: 'shubham@gmail.com', password: '12345678'}} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            cookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response 

        await logInHandler(req, res, next)
        expect(redis.hset).toHaveBeenCalled()
        expect(redis.expire).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledExactlyOnceWith(200)
        expect(res.json).toHaveBeenCalledExactlyOnceWith({
            message: "Login Successful",
            accessToken: '123'
        })
        expect(next).not.toHaveBeenCalled()
    })

    it("should call next with error if login service throws an error", async() => {
        const err = new Error('Login Service Error')
        logInServiceMock.mockRejectedValue(err)

        const req = { body: {email: 'shubham@gmail.com', password: '12345678'}} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            cookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response 

        await logInHandler(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
        expect(res.status).not.toHaveBeenCalled()
        expect(res.json).not.toHaveBeenCalled()
    })
})

describe('Refresh Handler Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const refreshServiceMock = refreshService as unknown as ReturnType<typeof vi.fn>
    it('should return 200 for successfull refresh', async() => {
        mockVerify.mockReturnValue({
            requestId: '12345'
        })
        mockHgetAll.mockResolvedValue({
            userId: 'qwerty'
        })

        refreshServiceMock.mockReturnValue({
            accessToken: '123',
            refreshId: '123',
            refreshToken: 'abc123'
        })

        const req = { signedCookies: { refreshToken: 'abc123'}} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            cookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response

        await refreshHandler(req, res, next)
        expect(res.status).toHaveBeenCalledExactlyOnceWith(200)
        expect(res.json).toHaveBeenCalledExactlyOnceWith({
            message: "Token Refreshed Successfully",
            accessToken: '123'
        })
        expect(next).not.toHaveBeenCalled()
    })

    it('should call next with error if refresh token is missing', async() => {
        const err = new AppError('Invalid Credentials', 401)
        const req = { signedCookies: {}} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            cookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response
        await refreshHandler(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
    })

    it('should call next with error if refresh token is invalid', async() => {
        const err = new AppError('Invalid Credentials', 401)
        mockVerify.mockImplementation(() => {
            throw new jwt.JsonWebTokenError('Invalid token')
        })
        const req = { signedCookies: { refreshToken: 'invalid_token' }} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            cookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response
        await refreshHandler(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
    })

    it('should call next with error if refresh token is expired', async() => {
        const err = new AppError('Invalid Credentials', 401)
        mockVerify.mockImplementation(() => {
            throw new jwt.TokenExpiredError('Token expired', new Date())
        })
        const req = { signedCookies: { refreshToken: 'expired_token' }} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            cookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response
        await refreshHandler(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
    })

    it('should call next with error if redis returns an empty object', async() => {
        const err = new AppError('Invalid Credentials', 401)
        mockVerify.mockReturnValue({
            requestId: '12345'
        })
        mockHgetAll.mockResolvedValue({})

        const req = { signedCookies: { refreshToken: 'abc123'}} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            cookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response

        await refreshHandler(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
    })
})

describe('Log Out Handler Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })
    it('should return 200 for successfull logout', async() => {
        mockVerify.mockReturnValue({
            requestId: '12345'
        })
        mockHgetAll.mockResolvedValue({
            userId: 'qwerty'
        })
        const req = { signedCookies: { refreshToken: 'test_token' }} as unknown as Request as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            clearCookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response
        await logOutHandler(req, res, next)
        expect(redis.hgetall).toHaveBeenCalled()
        expect(redis.del).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledExactlyOnceWith(200)
        expect(res.json).toHaveBeenCalledExactlyOnceWith({
            message: "Logged Out Successfully"
        })
        expect(res.clearCookie).toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
    })

    it('should call next with error if refresh token is missing', async() => {
        const err = new AppError('Already Logged Out', 400)
        const req = { signedCookies: {}} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            clearCookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response
        await logOutHandler(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
    })

    it('should call next with error if refresh token is invalid', async() => {
        const err = new AppError('Invalid Credentials', 401)
        mockVerify.mockImplementation(() => {
            throw new jwt.JsonWebTokenError('Invalid token')
        })
        const req = { signedCookies: { refreshToken: 'invalid_token' }} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            clearCookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response
        await logOutHandler(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
    })

    it('should call next with error if refresh token is expired', async() => {
        const err = new AppError('Invalid Credentials', 401)
        mockVerify.mockImplementation(() => {
            throw new jwt.TokenExpiredError('Token expired', new Date())
        })
        const req = { signedCookies: { refreshToken: 'expired_token' }} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            clearCookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response
        await logOutHandler(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
    })

    it('should call next with error if redis returns an empty object', async() => {
        const err = new AppError('Already Logged Out', 400)
        mockVerify.mockReturnValue({
            requestId: '12345'
        })

        mockHgetAll.mockResolvedValue({})
        const req = { signedCookies: { refreshToken: 'test_token' }} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            clearCookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response
        await logOutHandler(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
    })
})

describe('Reset Password Handler Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })
    const resetPwdServiceMock = resetPwdService as unknown as ReturnType<typeof vi.fn>

    it('should return 200 for successfull password reset', async() => {
        resetPwdServiceMock.mockResolvedValue(undefined)
        const req = { body: { token: 'abc123', newPassword: 'new_password' }, signedCookies: {} } as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response
        await resetPwdHandler(req, res, next)
        expect(res.status).toHaveBeenCalledExactlyOnceWith(200)
    })

    it('should call next with error if reset password service throws an error', async() => {
        const err = new Error('Reset Password Service Error')
        resetPwdServiceMock.mockRejectedValue(err)
        const req = { body: { token: 'abc123', newPassword: 'new_password' }, signedCookies: {} } as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response
        await resetPwdHandler(req, res, next)
        expect(next).toHaveBeenCalledExactlyOnceWith(err)
    })

    it('should clean everything and return 200 if refresh token is present in signed cookies', async() => {
        resetPwdServiceMock.mockResolvedValue(undefined)
        mockVerify.mockReturnValue({
            requestId: '12345'
        })
        mockHgetAll.mockResolvedValue({
            userId: 'qwerty'
        })
        const req = { body: { token: 'abc123', newPassword: 'new_password' }, signedCookies: { refreshToken: 'abc123' }} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            clearCookie: vi.fn(),
            getHeader: vi.fn()
        }as unknown as Response
        await resetPwdHandler(req, res, next)
        expect(res.status).toHaveBeenCalledExactlyOnceWith(200)
        expect(res.clearCookie).toHaveBeenCalled()
    })

})