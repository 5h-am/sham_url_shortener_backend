import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../../src/config/logger.ts', () => {
    return {
        logger: {
            error: vi.fn()
        }
    }
})

import { logger } from '../../src/config/logger.js'
import { AppError } from '../../src/utils/appError.js'
import { adminCheck } from '../../src/middlewares/admin.auth.middleware.js'
import { Request, Response, NextFunction  } from 'express'

describe("admin middleware test", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    it("should return next with nothing if role is admin", async() => {
        const req = {role: 'admin'} as unknown as Request
        const next = vi.fn()
        const res = {} as unknown as Response
        
        await adminCheck(req, res, next)

        expect(next).toHaveBeenCalledExactlyOnceWith()
    })

    it("should return next with AppError if role is not admin", async() => {
        const req = {role: 'user'} as unknown as Request
        const next = vi.fn()
        const res = {} as unknown as Response

        await adminCheck(req, res, next)

        expect(next).toHaveBeenCalledExactlyOnceWith(expect.any(AppError))
    })

    it("should return next with AppError if role is not present", async() => {
        const req = {} as unknown as Request
        const next = vi.fn()
        const res = {} as unknown as Response

        await adminCheck(req, res, next)

        expect(next).toHaveBeenCalledExactlyOnceWith(expect.any(AppError))
    })
})
