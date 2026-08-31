import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest'

vi.mock('../../../src/auth/auth.repositories.js', () => {
    return {
        loginDetailsFetcher: vi.fn(),
        forgetPwdEmail: vi.fn()
    }
})

vi.mock('argon2', () => {
    return {
        default: {
            verify: vi.fn()
        }
    }
})

vi.mock('jsonwebtoken', () => {
    return {
        default: {
            sign: vi.fn()
        }
    }
})

vi.mock('../../../src/utils/token.ts', () => {
    return {
        accessTokenGeneration: vi.fn(),
        refreshTokenGeneration: vi.fn()
    }
})

import { loginDetailsFetcher, forgetPwdEmail } from "../../../src/auth/auth.repositories.js"
import { logInService } from '../../../src/auth/auth.services'
import argon2 from 'argon2'
import { accessTokenGeneration, refreshTokenGeneration } from "../../../src/utils/token.js"
import { AppError } from "../../../src/utils/appError.js"
import jwt from 'jsonwebtoken'

afterEach(() => {
    vi.resetAllMocks()
})

describe("Log In Service Test", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    const mockLoginDetailsFetcher = loginDetailsFetcher as unknown as ReturnType<typeof vi.fn>
    const mockArgon = argon2.verify as unknown as ReturnType<typeof vi.fn>
    const mockAccessToken = accessTokenGeneration as unknown as ReturnType<typeof vi.fn>
    const mockRefreshToken = refreshTokenGeneration as unknown as ReturnType<typeof vi.fn>

    it('should return all the values for a successfull login', async() => {
        mockLoginDetailsFetcher.mockResolvedValue({
            id: '123',
            password_hash: 'hello',
            user_role: 'user'
        })

        mockArgon.mockReturnValue(true)
        mockAccessToken.mockReturnValue('qwerty')
        mockRefreshToken.mockReturnValue({
            refreshId: '234',
            refreshToken: '456'
        })

        const result = await logInService('shubham@gmail.com', '789')
        expect(result).toStrictEqual({
            accessToken: 'qwerty',
            refreshToken: '456',
            refreshId: '234',
            role: "user",
            userId: '123',
        })
    })

    it('should throw an error if user is not found', async() => {
        mockLoginDetailsFetcher.mockResolvedValue(undefined)
        await expect(logInService('shubham@gmail.com', '789')).rejects.toThrow(new AppError('Invalid Credentials', 401))
    })

    it('should throw an error if password is invalid', async() => {
        mockLoginDetailsFetcher.mockResolvedValue({
            id: '123',
            password_hash: 'hello'
        })
        mockArgon.mockReturnValue(false)
        await expect(logInService('shubham@gmail.com', '789')).rejects.toThrow(new AppError('Invalid Credentials', 401))
    })
})