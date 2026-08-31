import { expect, describe, it, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../../../src/config/queue.ts', () => {
    return {
        urlShortenerQueue: {
            add: vi.fn()
        },
        expiredUrlsQueue: {
            add: vi.fn()
        }
    }
})

vi.mock('../../../src/config/logger.ts', () => {
    return {
        logger: {
            error: vi.fn()
        }
    }
})

vi.mock('../../../src/config/redis.ts', () => {
    return {
        redis: {
            incr: vi.fn()
        }
    }
})


import { protectedUrlShortenerHandler } from '../../../src/urlShortener/urlShortener.handler.js'
import { urlShortenerQueue, expiredUrlsQueue } from '../../../src/config/queue.js'
import { logger } from '../../../src/config/logger.js'
import { redis } from '../../../src/config/redis.js'
import { Request, Response } from 'express'

describe("Protected url shortener Handler Test", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    const mockRedisIncr = redis.incr as unknown as ReturnType<typeof vi.fn>

    it("should return 200 and not add anything in the expire queue for not expiry params", async() => {
        mockRedisIncr.mockResolvedValue(43)

        const req = { body: { originalUrl: 'abc'}, query: {}, userId: 'abcd'} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        } as unknown as Response

        await protectedUrlShortenerHandler(req, res, next)
        expect(res.status).toHaveBeenCalledExactlyOnceWith(200)
        expect(urlShortenerQueue.add).toHaveBeenCalled()
        expect(expiredUrlsQueue.add).not.toHaveBeenCalled()
    })

    it("should return 200 and add in the expire queue for expiry params", async() => {
        mockRedisIncr.mockResolvedValue(43)

        const req = { body: { originalUrl: 'abc'}, query: { expiresAt: '2030-09-31T00:00:00.000Z' }, userId: 'abcd'} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            getHeader: vi.fn()
        } as unknown as Response

        await protectedUrlShortenerHandler(req, res, next)
        expect(res.status).toHaveBeenCalledExactlyOnceWith(200)
        expect(urlShortenerQueue.add).toHaveBeenCalled()
        expect(expiredUrlsQueue.add).toHaveBeenCalled()
    })

    it("should return 400 for invalid expiry params", async() => {
        mockRedisIncr.mockResolvedValue(43)

        const req = { body: { originalUrl: 'abc'}, query: { expiresAt: 'invalid-date' }, userId: 'abcd'} as unknown as Request
        const next = vi.fn()
        const res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            getHeader: vi.fn()
        } as unknown as Response

        await protectedUrlShortenerHandler(req, res, next)
        expect(urlShortenerQueue.add).toHaveBeenCalled()
        expect(expiredUrlsQueue.add).not.toHaveBeenCalled()
    })
})